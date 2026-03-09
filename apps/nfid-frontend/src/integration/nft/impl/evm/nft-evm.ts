import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import {
  EvmNftAsset,
  EvmNftMetadata,
} from "frontend/integration/ethereum/evm.service"
import { MarketPlace } from "src/integration/nft/enum/enums"
import {
  EvmNftFloorPrice,
  evmNftFloorPriceService,
} from "src/integration/nft/impl/evm/evm-nft-floor-price.service"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NftError } from "src/integration/nft/impl/nft-abstract"
import { NFT, NFTDetails } from "src/integration/nft/nft"

const BLOCKSCOUT_URLS: Partial<Record<number, string>> = {
  [ChainId.ETH]: "https://eth.blockscout.com",
  [ChainId.BASE]: "https://base.blockscout.com",
  [ChainId.POL]: "https://polygon.blockscout.com",
  [ChainId.ARB]: "https://arbitrum.blockscout.com",
  [ChainId.BNB]: "https://bsc.blockscout.com",
  [ChainId.ETH_SEPOLIA]: "https://eth-sepolia.blockscout.com",
  [ChainId.BASE_SEPOLIA]: "https://base-sepolia.blockscout.com",
  [ChainId.ARB_SEPOLIA]: "https://arbitrum-sepolia.blockscout.com",
  [ChainId.POL_AMOY]: "https://polygon-amoy.blockscout.com",
  [ChainId.BNB_TESTNET]: "https://bsc-testnet.blockscout.com",
}

function getBlockscoutBaseUrl(chainId: number): string {
  return BLOCKSCOUT_URLS[chainId] ?? `https://eth.blockscout.com`
}

function resolveImageUrl(asset: EvmNftAsset): string | undefined {
  return (
    asset.imageUrl ??
    (asset.metadata as EvmNftMetadata | undefined)?.image ??
    (asset.metadata as EvmNftMetadata | undefined)?.image_url
  )
}

export class EvmNftImpl implements NFT {
  private inited = false
  private error: string | undefined
  private assetPreview: AssetPreview | undefined
  private floorPrice: EvmNftFloorPrice | undefined

  constructor(private readonly asset: EvmNftAsset) {}

  async init(): Promise<NFT> {
    const imageUrl = resolveImageUrl(this.asset)
    if (imageUrl) {
      this.assetPreview = { url: imageUrl, format: "img" }
    }
    this.floorPrice = await evmNftFloorPriceService
      .getFloorPrice(this.asset.contract, this.asset.chainId)
      .catch(() => undefined)
    this.inited = true
    return this
  }

  isInited(): boolean {
    return this.inited
  }

  setError(e: NftError): void {
    this.error = e.props.Message
  }

  getError(): string | undefined {
    return this.error
  }

  getMillis(): number {
    return this.asset.acquiredAt ?? 0
  }

  getMarketPlace(): MarketPlace {
    return MarketPlace.EVM
  }

  getTokenMarketPlaceLink(): string {
    const base = getBlockscoutBaseUrl(this.asset.chainId)
    return `${base}/token/${this.asset.contract}/instance/${this.asset.tokenId}`
  }

  getCollectionMarketPlaceLink(): string {
    const base = getBlockscoutBaseUrl(this.asset.chainId)
    return `${base}/token/${this.asset.contract}`
  }

  getTokenId(): string {
    return `${this.asset.chainId}:${this.asset.contract}:${this.asset.tokenId}`
  }

  getTokenNumber(): number {
    return Number(this.asset.tokenId) || 0
  }

  getCollectionId(): string {
    return this.asset.contract
  }

  getCollectionName(): string {
    return (
      this.asset.tokenName ??
      `${this.asset.contract.slice(0, 6)}…${this.asset.contract.slice(-4)}`
    )
  }

  getTokenName(): string {
    const name =
      (this.asset.metadata as EvmNftMetadata | undefined)?.name ??
      this.asset.tokenName
    return name ? `${name} #${this.asset.tokenId}` : `#${this.asset.tokenId}`
  }

  getTokenFloorPrice(): number | undefined {
    return this.floorPrice?.nativePrice
  }

  getTokenFloorPriceFormatted(): string | undefined {
    if (!this.floorPrice) return undefined
    return `${this.floorPrice.nativePrice.toFixed(4)} ${this.floorPrice.symbol}`
  }

  getTokenFloorPriceUSDFormatted(): string | undefined {
    if (!this.floorPrice?.usdPrice) return undefined
    return `${this.floorPrice.usdPrice.toFixed(2)} USD`
  }

  getTokenFloorPriceUSD(): number | undefined {
    return this.floorPrice?.usdPrice
  }

  getTokenLink(): string {
    return this.getTokenMarketPlaceLink()
  }

  async getDetails(): Promise<NFTDetails> {
    const asset = this.asset
    return {
      getAbout: () =>
        (asset.metadata as EvmNftMetadata | undefined)?.description ?? "",
      getAssetFullSize: async (): Promise<AssetPreview> => ({
        url: resolveImageUrl(asset) ?? "",
        format: "img",
      }),
      getTransactions: async (): Promise<NFTTransactions> => ({
        activity: [],
        isLastPage: true,
      }),
      getProperties: async (): Promise<TokenProperties> => ({
        mappedValues: (
          (asset.metadata as EvmNftMetadata | undefined)?.attributes ?? []
        ).map((a) => ({
          category: a.trait_type,
          option: a.value,
        })),
      }),
    }
  }

  getAssetPreview(): AssetPreview | undefined {
    return this.assetPreview
  }
}

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
import { evmNftTransactionService } from "src/integration/nft/impl/evm/evm-nft-transaction.service"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NftError } from "src/integration/nft/impl/nft-abstract"
import { NFT, NFTDetails } from "src/integration/nft/nft"
import { ETH_DECIMALS, TRIM_ZEROS } from "@nfid/integration/token/constants"

const OPENSEA_CHAIN_MAP: Partial<Record<number, string>> = {
  [ChainId.ETH]: "ethereum",
  [ChainId.BASE]: "base",
  [ChainId.POL]: "matic",
  [ChainId.ARB]: "arbitrum",
  [ChainId.ETH_SEPOLIA]: "sepolia",
  [ChainId.BASE_SEPOLIA]: "base_sepolia",
  [ChainId.ARB_SEPOLIA]: "arbitrum_sepolia",
  [ChainId.POL_AMOY]: "amoy",
}

function resolveIpfsUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`
  }
  return url
}

function resolveImageUrl(asset: EvmNftAsset): string | undefined {
  return resolveIpfsUrl(
    asset.imageUrl ??
      (asset.metadata as EvmNftMetadata | undefined)?.image ??
      (asset.metadata as EvmNftMetadata | undefined)?.image_url,
  )
}

export class EvmNftImpl implements NFT {
  private inited = false
  private error: string | undefined
  private assetPreview: AssetPreview | undefined
  private floorPrice: EvmNftFloorPrice | undefined

  constructor(private readonly asset: EvmNftAsset) {}

  async init(): Promise<NFT> {
    if (this.inited) return this
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
    return 0
  }

  getMarketPlace(): MarketPlace {
    return MarketPlace.EVM
  }

  getTokenMarketPlaceLink(): string {
    const chain = OPENSEA_CHAIN_MAP[this.asset.chainId] ?? "ethereum"
    return `https://opensea.io/assets/${chain}/${this.asset.contract}/${this.asset.tokenId}`
  }

  getCollectionMarketPlaceLink(): string {
    const chain = OPENSEA_CHAIN_MAP[this.asset.chainId] ?? "ethereum"
    return `https://opensea.io/assets/${chain}/${this.asset.contract}`
  }

  getTokenId(): string {
    return `${this.asset.chainId}:${this.asset.contract}:${this.asset.tokenId}`
  }

  getChainId(): ChainId {
    return this.asset.chainId
  }

  getNftStandard(): string {
    return this.asset.type
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
    return `${this.floorPrice.nativePrice.toFixed(ETH_DECIMALS).replace(TRIM_ZEROS, "")} ${this.floorPrice.symbol}`
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
      getTransactions: (from: number): Promise<NFTTransactions> =>
        evmNftTransactionService.getTransactions(
          asset.chainId,
          asset.contract,
          asset.tokenId,
          from,
        ),
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

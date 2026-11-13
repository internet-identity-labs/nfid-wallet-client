import { MarketPlace } from "src/integration/nft/enum/enums"
import { NftError } from "src/integration/nft/impl/nft-abstract"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NFT, NFTDetails } from "src/integration/nft/nft"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class NftIcrc7 implements NFT {
  private _inited = true
  private _error: string | undefined
  private _assetPreview: AssetPreview | undefined

  constructor(
    private readonly _collectionId: string,
    private readonly _collectionName: string,
    private readonly _tokenId: bigint,
    private readonly _tokenName?: string,
    private readonly _imageUrl?: string,
  ) {
    if (_imageUrl) {
      this._assetPreview = { url: _imageUrl, format: "img" }
    }
  }

  async init(): Promise<NFT> {
    return this
  }

  isInited(): boolean {
    return this._inited
  }

  setError(e: NftError): void {
    this._error = e.props.Message
  }

  getError(): string | undefined {
    return this._error
  }

  getMillis(): number {
    return 0
  }

  getMarketPlace(): MarketPlace {
    return MarketPlace.ICRC7
  }

  getChainId(): ChainId {
    return ChainId.ICP
  }

  getNftStandard(): string {
    return "ICRC-7"
  }

  getTokenId(): string {
    return this._tokenId.toString()
  }

  getTokenNumber(): number {
    return Number(this._tokenId)
  }

  getCollectionId(): string {
    return this._collectionId
  }

  getCollectionName(): string {
    return this._collectionName
  }

  getTokenName(): string {
    return this._tokenName ?? `${this._collectionName} #${this._tokenId}`
  }

  getTokenFloorPrice(): number | undefined {
    return undefined
  }

  getTokenFloorPriceFormatted(): string | undefined {
    return undefined
  }

  getTokenFloorPriceUSDFormatted(): string | undefined {
    return undefined
  }

  getTokenFloorPriceUSD(): number | undefined {
    return undefined
  }

  getTokenLink(): string {
    return ""
  }

  getTokenMarketPlaceLink(): string {
    return ""
  }

  getCollectionMarketPlaceLink(): string {
    return ""
  }

  getAssetPreview(): AssetPreview | undefined {
    return this._assetPreview
  }

  async getDetails(): Promise<NFTDetails> {
    const imageUrl = this._imageUrl ?? ""
    return {
      getAbout: () => "",
      getAssetFullSize: async (): Promise<AssetPreview> => ({
        url: imageUrl,
        format: "img",
      }),
      getTransactions: async (): Promise<NFTTransactions> => ({
        activity: [],
        isLastPage: true,
      }),
      getProperties: async (): Promise<TokenProperties> => ({
        mappedValues: [],
      }),
    }
  }
}

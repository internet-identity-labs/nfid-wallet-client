import BigNumber from "bignumber.js"
import { encodeTokenIdentifier } from "src/integration/entrepot/ext"
import { entrepotAsset, getTokenLink } from "src/integration/entrepot/lib"
import { e8s } from "src/integration/nft/constants/constants"
import { MarketPlace } from "src/integration/nft/enum/enums"
import { MappedToken } from "src/integration/nft/geek/geek-types"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NFT, NFTDetails } from "src/integration/nft/nft"

import { exchangeRateService } from "@nfid/integration"

import { getCanisterStatus } from "../util/util"

export interface NftError {
  props: {
    Message: string
  }
}

export abstract class NftImpl implements NFT {
  private readonly millis: number
  private readonly marketPlace: MarketPlace
  private readonly tokenNumber: number
  private readonly tokenId: string
  private readonly collectionId: string
  private readonly collectionName: string
  private readonly tokenName: string
  private readonly tokenFloorPriceICP?: number
  private tokenFloorPriceUSD?: number
  private inited: boolean
  private error: string | undefined

  protected assetPreview: AssetPreview | undefined
  protected details: NFTDetails | undefined

  public constructor(geekData: MappedToken) {
    this.millis = geekData.millis
    this.marketPlace = geekData.marketPlace
    this.tokenNumber = geekData.tokenId
    this.collectionId = geekData.collectionId
    this.collectionName = geekData.collectionName
    this.tokenName = `${this.collectionName} #${this.tokenNumber}`
    this.tokenFloorPriceICP = geekData.tokenFloorPriceIcp
    this.tokenId = encodeTokenIdentifier(this.collectionId, this.tokenNumber)
    this.inited = false
    this.error = undefined
  }

  async init() {
    try {
      const [assetPreview] = await Promise.all([
        this.getAssetPreviewAsync(),
        getCanisterStatus(this.collectionId),
      ])
      this.assetPreview = assetPreview
      this.inited = true
    } catch (e) {
      this.setError(e as NftError)
    } finally {
      return this
    }
  }

  setError(e: NftError): void {
    this.error = e.props.Message
  }

  getError(): string | undefined {
    return this.error
  }

  isInited(): boolean {
    return this.inited
  }

  getMillis(): number {
    return this.millis
  }

  getMarketPlace(): MarketPlace {
    return this.marketPlace
  }

  abstract getTokenMarketPlaceLink(): string

  abstract getCollectionMarketPlaceLink(): string

  getTokenId(): string {
    return this.tokenId
  }

  getTokenNumber(): number {
    return this.tokenNumber
  }

  getCollectionId(): string {
    return this.collectionId
  }

  getCollectionName(): string {
    return this.collectionName
  }

  getTokenName(): string {
    return this.tokenName
  }

  getTokenFloorPriceIcpFormatted(): string | undefined {
    return this.tokenFloorPriceICP
      ? new BigNumber(this.tokenFloorPriceICP)
          .dividedBy(e8s)
          .toFormat(2, BigNumber.ROUND_DOWN, {
            groupSeparator: "",
            decimalSeparator: ".",
          }) + " ICP"
      : undefined
  }

  getTokenFloorPriceUSDFormatted(): string | undefined {
    this.setUpPrice()
    return this.tokenFloorPriceUSD
      ? this.tokenFloorPriceUSD.toFixed(2) + " USD"
      : undefined
  }

  getTokenFloorPriceUSD(): number | undefined {
    this.setUpPrice()
    return this.tokenFloorPriceUSD
  }

  abstract getDetails(): Promise<NFTDetails>

  getAssetPreview(): AssetPreview | undefined {
    return this.assetPreview
  }

  getTokenLink(): string {
    return getTokenLink(this.getCollectionId(), this.getTokenNumber())
  }

  protected getAssetPreviewAsync(): Promise<AssetPreview> {
    if (this.assetPreview === undefined) {
      let url = entrepotAsset(this.getCollectionId(), this.getTokenId(), false)
      return Promise.resolve({
        //TODO can we have not img format in preview?
        format: "img",
        url: url,
      })
    } else {
      return Promise.resolve(this.assetPreview)
    }
  }

  private setUpPrice() {
    if (this.tokenFloorPriceICP) {
      const usdIcp: BigNumber = exchangeRateService.getICP2USD()
      this.tokenFloorPriceUSD = usdIcp
        .multipliedBy(this.tokenFloorPriceICP)
        .dividedBy(e8s)
        .toNumber()
    }
  }
}

export abstract class NFTDetailsImpl implements NFTDetails {
  protected assetFullSize: Promise<AssetPreview> | undefined

  abstract getAbout(): string

  abstract getAssetFullSize(): Promise<AssetPreview>

  abstract getTransactions(from: number, to: number): Promise<NFTTransactions>

  abstract getProperties(): Promise<TokenProperties>
}

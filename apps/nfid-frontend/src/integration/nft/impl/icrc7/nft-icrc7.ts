import { MarketPlace } from "src/integration/nft/enum/enums"
import { NftError } from "src/integration/nft/impl/nft-abstract"
import {
  TransactionRecordAbstract,
  TransactionRecordView,
} from "src/integration/nft/impl/nft-transaction-record"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NFT, NFTDetails, TransactionRecord } from "src/integration/nft/nft"

import { authState } from "@nfid/integration"
import { icrc7HistoryService } from "@nfid/integration/marketplace"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import {
  E8S,
  ICP_DECIMALS,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"

class Icrc7TransactionRecord
  extends TransactionRecordAbstract
  implements TransactionRecord
{
  constructor(private readonly view: TransactionRecordView) {
    super()
  }
  getTransactionView(): TransactionRecordView {
    return this.view
  }
}

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
    private readonly _description?: string,
    private readonly _metadata: [string, string][] = [],
    private readonly _tradable: boolean = true,
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

  isTradable(): boolean {
    return this._tradable
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
    return {
      getAbout: () => this._description ?? "",
      getAssetFullSize: async (): Promise<AssetPreview> => ({
        url: this._imageUrl ?? "",
        format: "img",
      }),
      getTransactions: async (): Promise<NFTTransactions> => {
        const { publicKey } = authState.getUserIdData()
        const events = await icrc7HistoryService.getUserEvents(
          [this._collectionId],
          publicKey,
        )
        const activity = events
          .filter((e) => e.tokenId === this._tokenId)
          .map((e): TransactionRecord => {
            const price =
              e.priceE8s !== undefined
                ? `${(Number(e.priceE8s) / E8S).toFixed(ICP_DECIMALS).replace(TRIM_ZEROS, "")} ICP`
                : undefined
            const date = new Date(Number(e.timestamp / BigInt(1_000_000)))
            const type = e.kind.charAt(0).toUpperCase() + e.kind.slice(1)
            return new Icrc7TransactionRecord(
              new TransactionRecordView(type, e.from, e.to, price, date),
            )
          })
        return { activity, isLastPage: true }
      },
      getProperties: async (): Promise<TokenProperties> => ({
        mappedValues: this._metadata.map(([category, option]) => ({
          category,
          option,
        })),
      }),
    }
  }
}

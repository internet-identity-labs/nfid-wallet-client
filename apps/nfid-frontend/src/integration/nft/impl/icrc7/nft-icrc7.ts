import { NFTDetailsImpl, NftImpl } from "src/integration/nft/impl/nft-abstract"
import {
  TransactionRecordAbstract,
  TransactionRecordView,
} from "src/integration/nft/impl/nft-transaction-record"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NFTDetails, TransactionRecord } from "src/integration/nft/nft"
import { IcpNftToken } from "src/integration/nft/sources/nft-sources-types"

import { authState } from "@nfid/integration"
import { icrc7HistoryService } from "@nfid/integration/marketplace"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import {
  E8S,
  ICP_DECIMALS,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"

/** Shown when neither the token nor the collection has an image. */
export const ICRC7_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=="

/** An NFT of an ICRC-7 collection registered in the marketplace oracle. */
export class NftIcrc7 extends NftImpl {
  private readonly image: string
  private readonly about: string
  private readonly tradable: boolean
  private readonly metadata: Array<[string, string]>

  constructor(token: IcpNftToken) {
    super(token)
    this.image = token.image ?? token.collectionLogo ?? ICRC7_PLACEHOLDER_IMAGE
    this.about = token.description ?? ""
    this.tradable = token.tradable ?? true
    this.metadata = token.metadata ?? []
  }

  isTradable(): boolean {
    return this.tradable
  }

  async getDetails(): Promise<NFTDetails> {
    if (!this.details) {
      this.details = new NftIcrc7Details(
        this.about,
        this.image,
        this.getCollectionId(),
        this.getTokenNumber(),
        this.metadata,
      )
    }
    return this.details
  }

  /** ICRC-7 NFTs are traded in the wallet, not on an external marketplace. */
  getTokenMarketPlaceLink(): string {
    return ""
  }

  getCollectionMarketPlaceLink(): string {
    return ""
  }

  getTokenLink(): string {
    return this.image
  }

  getChainId(): ChainId {
    return ChainId.ICP
  }

  getNftStandard(): string {
    return "ICRC-7"
  }

  protected getAssetPreviewAsync(): Promise<AssetPreview> {
    return Promise.resolve({ format: "img", url: this.image })
  }
}

class Icrc7TransactionRecord extends TransactionRecordAbstract {
  constructor(private readonly view: TransactionRecordView) {
    super()
  }

  getTransactionView(): TransactionRecordView {
    return this.view
  }
}

class NftIcrc7Details extends NFTDetailsImpl {
  constructor(
    private readonly about: string,
    private readonly image: string,
    private readonly collectionId: string,
    private readonly tokenNumber: number,
    private readonly metadata: Array<[string, string]>,
  ) {
    super()
  }

  getAbout(): string {
    return this.about
  }

  getAssetFullSize(): Promise<AssetPreview> {
    return Promise.resolve({ format: "img", url: this.image })
  }

  async getTransactions(): Promise<NFTTransactions> {
    const { publicKey } = authState.getUserIdData()
    const events = await icrc7HistoryService.getUserEvents(
      [this.collectionId],
      publicKey,
    )
    const tokenId = BigInt(this.tokenNumber)
    const activity = events
      .filter((e) => e.tokenId === tokenId)
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
  }

  getProperties(): Promise<TokenProperties> {
    return Promise.resolve({
      mappedValues: this.metadata.map(([category, option]) => ({
        category,
        option,
      })),
    })
  }
}

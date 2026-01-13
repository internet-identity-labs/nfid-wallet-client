import { memeCakeTransactionMapper } from "src/integration/nft/impl/memecake/transaction/mamcake-transaction-mapper"
import { TransactionApiResponse } from "src/integration/nft/impl/memecake/transaction/transaction-types"
import {
  Collection,
  MemeCakeApiResponse,
  Token,
} from "src/integration/nft/impl/memecake/types/memcake-types"
import { NFTDetailsImpl, NftImpl } from "src/integration/nft/impl/nft-abstract"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NFTDetails, TransactionRecord } from "src/integration/nft/nft"

export class NftMemeCake extends NftImpl {
  async getDetails(): Promise<NFTDetails> {
    const nftResponse: MemeCakeApiResponse = await fetch(
      `https://memecake.io/api/nft/token/${`${this.getCollectionId()}-${this.getTokenNumber()}`}`,
    ).then((response) => response.json())
    return new NftMemeCakeDetails(
      nftResponse.data.collection,
      nftResponse.data.token,
    )
  }

  getTokenMarketPlaceLink(): string {
    return `https://memecake.io/token/${this.getCollectionId()}-${this.getTokenNumber()}`
  }

  getCollectionMarketPlaceLink(): string {
    const collectionName = this.getCollectionName()
      .toLowerCase()
      .replaceAll(" ", "")
    return `https://memecake.io/collection/${collectionName}`
  }
}

class NftMemeCakeDetails extends NFTDetailsImpl {
  private collection: Collection
  private token: Token

  constructor(collection: Collection, token: Token) {
    super()
    this.collection = collection
    this.token = token
  }

  getAbout(): string {
    return this.collection.collectionDescription
  }

  getAssetFullSize(): Promise<AssetPreview> {
    return Promise.resolve({
      url: this.token.image,
      //mc API does not return the format of the asset, so we assume it is an image
      format: "img",
    })
  }

  async getTransactions(from: number, to: number): Promise<NFTTransactions> {
    const response: TransactionApiResponse = await fetch(
      `https://memecake.io/api/nft/token/${`${
        this.collection.collectionOnChainPublicAddress
      }-${this.token.tokenIndex}`}/activities`,
    ).then((response) => response.json())

    const transactions: TransactionRecord[] = response.data
      .map((transaction) =>
        memeCakeTransactionMapper.toTransactionRecord(transaction),
      )
      .filter((tx): tx is TransactionRecord => tx !== null)

    const slicedTransactions = transactions.slice(from, to)

    const isLastPage = to >= transactions.length

    return {
      activity: slicedTransactions,
      isLastPage,
    }
  }

  //not implemented
  async getProperties(): Promise<TokenProperties> {
    return {
      mappedValues: [],
    }
  }
}

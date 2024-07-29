import { NFTExt } from "src/integration/nft/impl/ext/nft-ext"
import { memeCakeTransactionMapper } from "src/integration/nft/impl/memecake/transaction/mamcake-transaction-mapper"
import { TransactionApiResponse } from "src/integration/nft/impl/memecake/transaction/transaction-types"
import {
  Collection,
  MemeCakeApiResponse,
  Token,
} from "src/integration/nft/impl/memecake/types/memcake-types"
import { NFTDetailsImpl } from "src/integration/nft/impl/nft-abstract"
import {
  AssetPreview,
  NFTTransactions,
} from "src/integration/nft/impl/nft-types"
import { NFTDetails, TransactionRecord } from "src/integration/nft/nft"

export class NftMemeCake extends NFTExt {
  async getDetails(): Promise<NFTDetails> {
    let nftResponse: MemeCakeApiResponse = await fetch(
      `https://memecake.io/api/nft/token/${
        this.getCollectionId() + "-" + this.getTokenNumber()
      }`,
    ).then((response) => response.json())
    return new NftMemeCakeDetails(
      nftResponse.data.collection,
      nftResponse.data.token,
    )
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
      `https://memecake.io/api/nft/token/${
        this.collection.collectionOnChainPublicAddress +
        "-" +
        this.token.tokenIndex
      }/activities`,
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
}

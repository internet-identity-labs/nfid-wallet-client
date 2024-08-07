import { NFTDetailsImpl, NftImpl } from "src/integration/nft/impl/nft-abstract"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { yumiPropertiesService } from "src/integration/nft/impl/yumi/properties/properties-service"
import { yumiTransactionMapper } from "src/integration/nft/impl/yumi/transaction/yumi-transaction-mapper"
import {
  ApiResponse,
  NftInfo,
} from "src/integration/nft/impl/yumi/transaction/yumi-trs-types"
import {
  CollectionData,
  CollectionResponse,
} from "src/integration/nft/impl/yumi/types/yumi-types"
import { NFTDetails, TransactionRecord } from "src/integration/nft/nft"

export class NftYumi extends NftImpl {
  async getDetails(): Promise<NFTDetails> {
    let collectionResponse = (await fetch(
      `https://stat.yuku.app/api/collection/${this.getCollectionId()}`,
    ).then((response) => response.json())) as CollectionResponse
    return new NFTYumiDetails(collectionResponse.data, this.getTokenNumber())
  }
}

class NFTYumiDetails extends NFTDetailsImpl {
  private collectionData: CollectionData
  private readonly tokenNumber: number
  private nftInfo: NftInfo | undefined | null

  constructor(collection: CollectionData, tokenNumber: number) {
    super()
    this.collectionData = collection
    this.tokenNumber = tokenNumber
  }

  getAbout(): string {
    return this.collectionData.description
  }

  getAssetFullSize(): Promise<AssetPreview> {
    return Promise.resolve({
      url: this.collectionData.logo,
      //yuku API does not return the format of the asset, so we assume it is an image
      format: "img",
    })
  }

  async getTransactions(from: number, to: number): Promise<NFTTransactions> {
    const limit = to - from + 1
    const page = Math.floor(from / limit) + 1
    console.log(
      `Fetching transactions for token ${this.tokenNumber} from page ${page} with limit ${limit}`,
    )

    const response: ApiResponse = await this.fetchTransactions(page, limit)

    const transactions: TransactionRecord[] = response.data.data
      .map((transaction) =>
        yumiTransactionMapper.toTransactionRecord(transaction),
      )
      .filter((tx): tx is TransactionRecord => tx !== null)

    const isLastPage = response.data.page.page >= response.data.page.page_count

    if (transactions.length !== 0) {
      this.nftInfo = response.data.data[0].nft_info
    } else {
      this.nftInfo = null
    }

    return {
      activity: transactions,
      isLastPage: isLastPage,
    }
  }

  async getProperties(): Promise<TokenProperties> {
    if (this.nftInfo === undefined) {
      const response = await this.fetchTransactions(0, 1)
      if (response.data.data.length !== 0) {
        this.nftInfo = response.data.data[0].nft_info
      } else {
        this.nftInfo = null
        return { mappedValues: [] }
      }
    }
    if (this.nftInfo === null) {
      return { mappedValues: [] }
    }
    if (typeof this.nftInfo.metadata === "string") {
      return yumiPropertiesService.getProperties(
        JSON.parse(this.nftInfo.metadata),
      )
    } else {
      return yumiPropertiesService.getProperties(this.nftInfo.metadata)
    }
  }

  private async fetchTransactions(
    page: number,
    limit: number,
  ): Promise<ApiResponse> {
    return await fetch(`https://stat.yuku.app/api/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        canister: this.collectionData.canister,
        token_id: this.tokenNumber.toString(),
        page: page,
        limit: limit,
      }),
    }).then((response) => response.json())
  }
}

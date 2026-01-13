import { actorBuilder, hasOwnProperty } from "@nfid/integration"

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
import { array2string } from "src/integration/nft/impl/yumi/util/util"
import { NFTDetails, TransactionRecord } from "src/integration/nft/nft"

import { idlFactory } from "./idl/yumiNft"
import { _SERVICE as YukuNftCanister } from "./idl/yumiNft.d"

export class NftYumi extends NftImpl {
  private url: undefined | string
  protected getAssetPreviewAsync(): Promise<AssetPreview> {
    const nftActor = actorBuilder<YukuNftCanister>(
      this.getCollectionId(),
      idlFactory,
    )
    return nftActor.getTokensByIds([this.getTokenNumber()]).then((token) => {
      if (token.length === 0) {
        return super.getAssetPreviewAsync()
      }
      const data = token[0][1]
      const metadata = hasOwnProperty(data, "nonfungible")
        ? // @ts-ignore
          (data.nonfungible.metadata[0] as Array<number>)
        : null

      if (!metadata || metadata.length === 0) {
        return super.getAssetPreviewAsync()
      }
      const json = array2string(new Uint8Array(metadata))
      const raw = JSON.parse(json.replace(/\n/g, "\\n").replace(/\r/g, "\\r"))
      this.url = raw.url
      return {
        url: raw.thumb ?? raw.url,
        format: "img",
      }
    })
  }

  getTokenMarketPlaceLink(): string {
    return `https://yuku.app/market/${this.getCollectionId()}/${this.getTokenId()}`
  }

  getCollectionMarketPlaceLink(): string {
    return `https://yuku.app/market/${this.getCollectionId()}`
  }

  async getDetails(): Promise<NFTDetails> {
    const collectionResponse = (await fetch(
      `https://stat.yuku.app/api/collection/${this.getCollectionId()}`,
    ).then((response) => response.json())) as CollectionResponse
    return new NFTYumiDetails(
      collectionResponse.data,
      this.getTokenNumber(),
      this.url,
    )
  }
}

class NFTYumiDetails extends NFTDetailsImpl {
  private collectionData: CollectionData
  private readonly tokenNumber: number
  private nftInfo: NftInfo | undefined | null
  private url: string | undefined

  constructor(
    collection: CollectionData,
    tokenNumber: number,
    url: string | undefined,
  ) {
    super()
    this.collectionData = collection
    this.tokenNumber = tokenNumber
    this.url = url
  }

  getAbout(): string {
    return this.collectionData.description
  }

  getAssetFullSize(): Promise<AssetPreview> {
    return Promise.resolve({
      url:
        this.url ??
        this.nftInfo?.thumbnail_url ??
        this.nftInfo?.media_url ??
        this.collectionData.logo,
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
      isLastPage,
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
        page,
        limit,
      }),
    }).then((response) => response.json())
  }
}

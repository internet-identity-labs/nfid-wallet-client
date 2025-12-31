import { assetFullsize, fetchCollection } from "src/integration/entrepot/lib"
import { EntrepotCollection } from "src/integration/entrepot/types"
import { extPropertiesService } from "src/integration/nft/impl/ext/properties/properties-service"
import { extTransactionMapper } from "src/integration/nft/impl/ext/transaction/ext-transaction-mapper"
import {
  ResponseData,
  TransactionToniq,
} from "src/integration/nft/impl/ext/transaction/types"
import { NFTDetailsImpl, NftImpl } from "src/integration/nft/impl/nft-abstract"
import { NFTDetails, TransactionRecord } from "src/integration/nft/nft"

import { AssetPreview, TokenProperties } from "../nft-types"

const TOKEN_API =
  "https://us-central1-entrepot-api.cloudfunctions.net/api/token"

export class NftExt extends NftImpl {
  async getDetails(): Promise<NFTDetails> {
    if (this.details === undefined) {
      return fetchCollection(this.getCollectionId()).then((collection) => {
        this.details = new NFTExtDetails(
          collection,
          this.getTokenId(),
          this.getTokenNumber(),
        )
        return this.details
      })
    }
    return this.details
  }

  getTokenMarketPlaceLink(): string {
    return `https://toniq.io/marketplace/asset/${this.getTokenId()}`
  }

  getCollectionMarketPlaceLink(): string {
    return `https://toniq.io/marketplace/${this.getCollectionId()}`
  }
}

class NFTExtDetails extends NFTDetailsImpl {
  private readonly collection: EntrepotCollection
  private readonly tokenId: string
  private readonly tokenNumber: number

  constructor(
    collection: EntrepotCollection,
    tokenId: string,
    tokenNumber: number,
  ) {
    super()
    this.collection = collection
    this.tokenId = tokenId
    this.tokenNumber = tokenNumber
  }

  getAbout(): string {
    return this.collection.description
  }

  async getTransactions(
    _from: number,
    _to: number,
  ): Promise<{ activity: Array<TransactionRecord>; isLastPage: boolean }> {
    let url = `${TOKEN_API}/${this.tokenId}`
    let responseData: ResponseData = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json())
    const trss: TransactionRecord[] = responseData.transactions
      .map((raw: TransactionToniq) =>
        extTransactionMapper.toTransactionRecordToniq(raw),
      )
      .filter(
        (tx: TransactionRecord | null): tx is TransactionRecord => tx !== null,
      )
    return {
      activity: trss,
      isLastPage: true,
    }
  }

  async getAssetFullSize(): Promise<AssetPreview> {
    if (this.assetFullSize === undefined) {
      this.assetFullSize = assetFullsize(
        this.getCollection(),
        this.tokenId,
        true,
      )
      return this.assetFullSize
    } else {
      return this.assetFullSize
    }
  }

  async getProperties(): Promise<TokenProperties> {
    return extPropertiesService.getProperties(
      this.getCollection().id,
      this.tokenNumber,
    )
  }

  private getCollection(): EntrepotCollection {
    return this.collection
  }
}

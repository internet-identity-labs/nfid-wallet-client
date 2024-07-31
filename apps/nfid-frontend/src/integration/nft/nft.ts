import { MarketPlace, TransactionType } from "src/integration/nft/enum/enums"
import { TransactionRecordView } from "src/integration/nft/impl/nft-transaction-record"
import {
  AssetPreview,
  NFTTransactions,
} from "src/integration/nft/impl/nft-types"

export interface NFT {
  getMillis(): number
  getMarketPlace(): MarketPlace
  getTokenId(): string
  getTokenNumber(): number
  getCollectionId(): string
  getCollectionName(): string
  getTokenName(): string
  getTokenFloorPriceIcp(): number | undefined
  getTokenFloorPriceUSD(): number | undefined
  getTokenLink(): string
  getDetails(): Promise<NFTDetails>
  //we can not know asset type without call to host (probably)
  getAssetPreview(): Promise<AssetPreview>
  //TODO
  //transfer(): Promise<bigint>;
}

export interface NFTDetails {
  getAbout(): string
  getAssetFullSize(): Promise<AssetPreview>
  getTransactions(from: number, to: number): Promise<NFTTransactions>
}

export interface TransactionRecord {
  getTransactionView(): TransactionRecordView
}

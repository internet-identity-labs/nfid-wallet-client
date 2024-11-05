import { MarketPlace } from "src/integration/nft/enum/enums"
import { TransactionRecordView } from "src/integration/nft/impl/nft-transaction-record"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"

export interface NFT {
  init(): Promise<NFT>
  getMillis(): number
  getMarketPlace(): MarketPlace
  getTokenMarketPlaceLink(): string
  getTokenId(): string
  getTokenNumber(): number
  getCollectionId(): string
  getCollectionName(): string
  getTokenName(): string
  getTokenFloorPriceIcpFormatted(): string | undefined
  getTokenFloorPriceUSDFormatted(): string | undefined
  getTokenFloorPriceUSD(): number | undefined
  getTokenLink(): string
  getDetails(): Promise<NFTDetails>
  //we can not know asset type without call to host (probably)
  getAssetPreview(): AssetPreview
  //TODO
  //transfer(): Promise<bigint>;
}

export interface NFTDetails {
  getAbout(): string
  getAssetFullSize(): Promise<AssetPreview>
  getTransactions(from: number, to: number): Promise<NFTTransactions>
  getProperties(): Promise<TokenProperties>
}

export interface TransactionRecord {
  getTransactionView(): TransactionRecordView
}

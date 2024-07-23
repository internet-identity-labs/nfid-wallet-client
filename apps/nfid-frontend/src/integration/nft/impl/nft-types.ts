import { TransactionRecord } from "src/integration/nft/nft"

export type AssetPreview = {
  url: string
  format: DisplayFormat
}

export type NFTTransactions = {
  activity: TransactionRecord[]
  isLastPage: boolean
}

export type DisplayFormat = "img" | "iframe" | "video"

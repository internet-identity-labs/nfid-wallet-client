import { TransactionRecord } from "src/integration/nft/nft"

export type AssetPreview = {
  url: string
  format: DisplayFormat
}

export type NFTTransactions = {
  activity: TransactionRecord[]
  isLastPage: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
}

export type DisplayFormat = "img" | "iframe" | "video"

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
  nftsWithoutPrice: number
}

export interface MappedValue {
  category: string | undefined
  option: string | undefined
}

export interface TokenProperties {
  mappedValues: MappedValue[]
}

export type DisplayFormat = "img" | "iframe" | "video"

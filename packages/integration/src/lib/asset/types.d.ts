import { BigNumber } from "@rarible/utils"

declare type Asset = {
  getActivitiesByItem(
    tokenId: string,
    contract: string,
    cursor?: string,
    size?: number,
  ): Promise<NonFungibleActivityRecords>
  getActivitiesByUser(
    cursor?: string,
    size?: number,
  ): Promise<NonFungibleActivityRecords>
  getItemsByUser(cursor?: string, size?: number): Promise<NonFungibleItems>
  getBalance(): Promise<Balance>
  transferNft(
    tokenId: string,
    constract: string,
    receiver: string,
  ): Promise<void>
  getFungibleActivityByUser({page, size, sort}: {
    page?: number,
    size?: number,
    sort?: "asc" | "desc",
   } = {}): Promise<any>
}

declare type Balance = {
  balance?: BigNumber
  balanceinUsd?: BigNumber
}

declare type FungibleActivityRecords = {
  page?: number
  size?: number
  activities: Array<ActivityRecord>
}

declare type ActivityRecord = {
  id: string
  type: string
  to: string
  from: string
  date: string
  transactionHash: string
  price?: string
  priceUsd?: string
  error?: boolean
}

declare type NonFungibleActivityRecords = {
  cursor?: string
  activities: Array<ActivityRecord>
}

declare type NonFungibleItems = {
  total?: number
  items: Array<NonFungibleItem>
}

declare type NonFungibleItem = {
  id: string
  blockchain: string
  collection?: string
  contract?: string
  tokenId?: string
  lastUpdatedAt: string
}

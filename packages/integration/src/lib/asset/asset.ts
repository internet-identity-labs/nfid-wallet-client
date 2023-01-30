import { BigNumber } from "@rarible/utils"

export declare type Asset = {
  getActivitiesByItem(
    itemId: string,
    cursor?: string,
    size?: number,
  ): Promise<NonFungibleActivityRecords>
  getActivitiesByUser(
    cursor?: string,
    size?: number,
  ): Promise<NonFungibleActivityRecords>
  getItemsByUser(cursor?: string, size?: number): Promise<NonFunmgibleItems>
  getBalance(): Promise<Balance>
  transferNft(
    tokenId: string,
    constract: string,
    receiver: string,
  ): Promise<void>
}

export declare type Balance = {
  balance?: BigNumber
  balanceinUsd?: BigNumber
}

export declare type NonFungibleActivityRecord = {
  id: string
  type: string
  to: string
  from: string
  date: string
  transactionHash: string
  price?: string
  priceUsd?: string
}

export declare type NonFungibleActivityRecords = {
  cursor?: string
  activities: Array<NonFungibleActivityRecord>
}

export declare type NonFunmgibleItems = {
  total?: number
  items: Array<NonFungibleItem>
}

export declare type NonFungibleItem = {
  id: string
  blockchain: string
  collection?: string
  contract?: string
  tokenId?: string
  lastUpdatedAt: string
}

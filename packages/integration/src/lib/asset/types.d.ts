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
  getErc20TokensByUser(cursor?: string): Promise<Tokens>
  getFungibleActivityByTokenAndUser(
    request: FungibleActivityRequest,
  ): Promise<FungibleActivityRecords>
}

declare type FungibleActivityRequest = {
  direction?: "from" | "to"
  contract?: string
  cursor?: string
  size?: number
  sort?: "asc" | "desc"
}

declare type Tokens = {
  cursor?: string
  tokens: Array<Token>
}

declare type Token = {
  name: string
  symbol: string
  logo?: string
  balance: string
  contractAddress: string
}

declare type Balance = {
  balance?: BigNumber
  balanceinUsd?: BigNumber
}

declare type FungibleActivityRecords = {
  cursor?: string
  activities: Array<FungibleActivityRecord>
}

declare type FungibleActivityRecord = {
  id: string
  date: string
  to: string
  from: string
  transactionHash: string
  price: number
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

declare type TokenPrice = {
  token: string
  price: string
}

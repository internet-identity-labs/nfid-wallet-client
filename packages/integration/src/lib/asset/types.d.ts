import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common";
import { BigNumber } from "@rarible/utils";
import { Network } from "alchemy-sdk";

declare type NonFungibleAsset = FungibleAsset &  {
  getActivitiesByItem(
    request: ActivitiesByItemRequest,
  ): Promise<NonFungibleActivityRecords>
  getActivitiesByUser(
    request?: PageRequest & SortRequest,
  ): Promise<NonFungibleActivityRecords>
  getItemsByUser(request?: PageRequest): Promise<NonFungibleItems>
  transferNft(
    tokenId: string,
    constract: string,
    receiver: string,
  ): Promise<void>
  getErc20TokensByUser(request?: CursorRequest): Promise<Tokens>
}

declare type FungibleAsset = {
  getBalance(address?: string): Promise<ChainBalance>
  getFungibleActivityByTokenAndUser(
    request: FungibleActivityRequest
  ): Promise<FungibleActivityRecords>
}

declare type SortRequest = {
  sort?: "asc" | "desc"
}

declare type CursorRequest = {
  cursor?: string
}

declare type PageRequest = CursorRequest & {
  size?: number
  address?: string
}

declare type ActivitiesByItemRequest = PageRequest &
  SortRequest & {
    tokenId: string
    contract: string
  }

declare type FungibleActivityRequest = PageRequest & {
  address?: string
  direction?: "from" | "to"
  contract?: string
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

declare type ChainBalance = {
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

declare type Configuration = {
  currencyId: string
  blockchain: EVMBlockchain
  unionBlockchain: EVMBlockchain
  provider: {
    mainnet: string
    testnet: string
  }
  alchemy: { mainnet: Network; testnet: Network }
}

import { DelegationIdentity } from "@dfinity/identity"

import { Asset } from "./asset"
import { Category, ChainId } from "../token/icrc1/enum/enums"

declare type Address = string
declare type Identity = DelegationIdentity | Address

declare type TransferResponse = {
  time: number
  waitOnChain: Promise<{ total: string; totalUSD: string }>
}

declare type NonFungibleAssetI = Asset &
  FungibleAsset & {
    getActivitiesByItem(
      request: ActivitiesByItemRequest,
    ): Promise<NonFungibleActivityRecords>
    getActivitiesByUser(
      request: ActivitiesByUserRequest,
    ): Promise<NonFungibleActivityRecords>
    getItemsByUser(request: ItemsByUserRequest): Promise<NonFungibleItems>
    getAddress(delegation?: DelegationIdentity): Promise<string>
  }

declare type FungibleAsset = Asset & {
  transfer(
    identity: DelegationIdentity,
    transaction: FungibleTransactionRequest,
  ): Promise<TransferResponse>
  getAddress(identity: DelegationIdentity): Promise<string>
  getTransactionHistory(identity: DelegationIdentity): Promise<FungibleTxs>
  getBalance(
    address?: string,
    delegation?: DelegationIdentity,
  ): Promise<ChainBalance>
  getFungibleActivityByTokenAndUser(
    request: FungibleActivityRequest,
    delegation?: DelegationIdentity,
  ): Promise<FungibleActivityRecords>
  getBlockchain(): string
}

declare type ActivitiesByItemRequest = {
  tokenId: string
  contract: string
  cursor?: string
  sort?: "asc" | "desc"
  size?: number
}

declare type ActivitiesByUserRequest = {
  identity: Identity
  cursor?: string
  sort?: "asc" | "desc"
  size?: number
}

declare type ItemsByUserRequest = {
  identity: Identity
  cursor?: string
  size?: number
}

declare type BalanceRequest = {
  identity: Identity
}

declare type TransferNftRequest = {
  delegation: DelegationIdentity
  tokenId: string
  contract: string
  receiver: string
}

declare type FungibleActivityRequest = PageRequest & {
  address?: string
  direction?: "from" | "to"
  contract?: string
  sort?: "asc" | "desc"
  size?: number
  address?: string
  cursor?: string
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
  balanceinUsd: string
  contractAddress?: string
  address: string
  rate?: number | undefined
  decimals: number
}

declare type ChainBalance = {
  balance?: string
  balanceinUsd?: string
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
  asset?: string
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
  thumbnail?: string
  image: string
  title: string
  description: string
  tokenType: string
  contractName?: string
  contractSymbol?: string
  imageType?: "img" | "video" | "iframe"
}

declare type TokenPrice = {
  token: string
  price: number
}

declare interface AccountBalance {
  accountName: string
  tokenBalance: Balance
  usdBalance: string
  principalId: string
  address: string
}

declare interface AppBalance {
  icon?: string
  appName: string
  tokenBalance: Balance
  accounts: AccountBalance[]
}

declare interface TokenBalanceSheet {
  label: string
  token: string
  icon: string
  tokenBalance: Balance
  usdBalance: string
  applications: { [applicationName: string]: AppBalance | undefined }
  blockchain?: string
  contract?: string
  fee?: string
  address: string
}

declare interface TransactionRow {
  type: "Sent" | "Received"
  asset: string
  quantity: number
  date: string
  from: string
  to: string
}

export interface FungibleTxs {
  sendTransactions?: FungibleActivityRecords
  receivedTransactions?: FungibleActivityRecords
}

export interface FungibleTransactionRequest {
  amount: number
  to: string
}

declare interface Activity {
  id: string
  date: Date
  from: string
  to: string
  transactionHash: string
  action: ActivityAction
  asset: ActivityAssetFT | ActivityAssetNFT
  transaction?: SwapTransaction
}

export interface ActivityAssetNFT {
  type: "nft"
  name: string
  preview: string
  previewType: string
  amount?: string
  amountTo?: string
  error?: string
}

export interface ActivityAssetFT {
  type: "ft"
  currency: string
  currencyTo?: string
  amount: number
  amountTo?: number
  icon?: string
  iconTo?: string
  rate: number | undefined
  decimals: number
  decimalsTo?: number
  canister: string
  chainId: ChainId
  category?: Category
  rootCanister?: string
}

declare type Content = {
  contentUrl: string
  contentType?: "video" | "img" | "iframe"
  val: Item
}

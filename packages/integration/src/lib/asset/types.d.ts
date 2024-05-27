import { DelegationIdentity } from "@dfinity/identity"
import { TransactionRequest } from "@ethersproject/abstract-provider"
import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { BigNumber } from "@rarible/utils"
import { Network } from "alchemy-sdk"

import { Asset } from "./asset"
import { ErrorCode } from "./error-code.enum"
import { Erc20TransferRequest } from "./estimate-transaction-service/populate-transaction-service/erc20-populate-transaction.service"

declare type Address = string
declare type Identity = DelegationIdentity | Address

declare type TransferResponse = {
  etherscanTransactionUrl: string
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
    getErc20TokensByUser(request: Erc20TokensByUserRequest): Promise<Tokens>
    getAddress(delegation?: DelegationIdentity): Promise<string>
    getEstimatedTransaction(
      request: EstimatedTransactionRequest,
    ): Promise<EstimatedTransaction>
  }

declare type FungibleAsset = Asset & {
  transfer(
    identity: DelegationIdentity,
    transaction: TransactionRequest | FungibleTransactionRequest,
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

declare type TransferETHRequest = {
  delegation: DelegationIdentity
  to: string
  amount: string
}

declare type Erc20TokensByUserRequest = {
  identity: Identity
  address?: string
  cursor?: string
}

declare type EstimatedTransaction = {
  transaction: TransactionRequest
  fee: string
  feeUsd: string
  maxFee: string
  maxFeeUsd: string
  value?: string
  valueUsd?: string
  total: string
  totalUsd: string
  errors: ErrorCode[]
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
  price: string
}

declare type Configuration = {
  currencyId: string
  blockchain: EVMBlockchain
  unionBlockchain: EVMBlockchain
  providerUrl: string
  alchemyNetwork: alchemyNetwork
  etherscanUrl: string
  raribleEnv: RaribleSdkEnvironment
  raribleApiKey: string
  symbol: string
  token: string
  blockchainName: string
  alchemyApiKey: string
  activitiesTypes: AssetTransfersCategory[]
}

declare type EstimateTransactionRequest =
  | EthTransferRequest
  | NftERC721TransferRequest
  | NftERC1155TransferRequest
  | Erc20TransferRequest

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
}

declare interface ActivityAssetNFT {
  type: "nft"
  name: string
  preview: string
  previewType: string
  amount?: string
}

declare interface ActivityAssetFT {
  type: "ft"
  currency: string
  amount: number
  amountUSD?: string
}

declare type Content = {
  contentUrl: string
  contentType?: "video" | "img" | "iframe"
  val: Item
}

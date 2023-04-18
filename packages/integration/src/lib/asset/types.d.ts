import { DelegationIdentity } from "@dfinity/identity"
import { TransactionRequest } from "@ethersproject/abstract-provider"
import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { BigNumber } from "@rarible/utils"
import { Network } from "alchemy-sdk"

import { Balance } from "@nfid/integration"

declare type Address = string
declare type Identity = DelegationIdentity | Address
declare type EtherscanTransactionHashUrl = string

declare type NonFungibleAsset = FungibleAsset & {
  getActivitiesByItem(
    request: ActivitiesByItemRequest,
  ): Promise<NonFungibleActivityRecords>
  getActivitiesByUser(
    request: ActivitiesByUserRequest,
  ): Promise<NonFungibleActivityRecords>
  getItemsByUser(request: ItemsByUserRequest): Promise<NonFungibleItems>
  transfer(
    identity: DelegationIdentity,
    transaction: TransactionRequest,
  ): Promise<EtherscanTransactionHashUrl>
  getErc20TokensByUser(request: Erc20TokensByUserRequest): Promise<Tokens>
  getAddress(delegation?: DelegationIdentity): Promise<string>
  getEstimatedTransaction(
    request: EstimatedTransactionRequest,
  ): Promise<EstimatedTransaction>
}

declare type FungibleAsset = {
  getBalance(
    address?: string,
    delegation?: DelegationIdentity,
  ): Promise<ChainBalance>
  getFungibleActivityByTokenAndUser(
    request: FungibleActivityRequest,
    delegation?: DelegationIdentity,
  ): Promise<FungibleActivityRecords>
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
  cursor?: string
}

declare type EstimatedTransaction = {
  transaction: TransactionRequest
  fee: string
  feeUsd: string
  maxFee: string
  maxFeeUsd: string
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
  contractAddress: string
  address: string
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
  thumbnail?: string
  image: string
  title: string
  description: string
  tokenType: string
  contractName?: string
  contractSymbol?: string
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
  etherscanUrl: {
    mainnet: string
    testnet: string
  }
}

declare interface EstimatedTransactionRequest {
  to: string
  identity: DelegationIdentity
}

declare type EthEstimatedTransactionRequest =
  | EthTransferRequest
  | NftERC721TransferRequest
  | NftERC1155TransferRequest

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
}


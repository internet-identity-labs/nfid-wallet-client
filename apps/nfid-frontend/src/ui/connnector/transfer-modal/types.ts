import { DelegationIdentity } from "@dfinity/identity"
import { Icrc1BlockIndex } from "@dfinity/ledger-icp/dist/candid/ledger"
import { FungibleAsset } from "packages/integration/src/lib/asset/types"

import { IGroupOption, IGroupedOptions } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"

import { Blockchain, NativeToken, StandardizedToken } from "../types"

export enum TransferModalType {
  FT = "ft",
  FT20 = "ft20",
  NFT = "nft",
}

export type ITransferConfig = {
  title?: string
  type: TransferModalType
  icon: string
  tokenStandard: TokenStandards
  blockchain: Blockchain
  feeCurrency?: NativeToken
  addressPlaceholder: string
  assetService?: FungibleAsset
  isNativeToken?: boolean
  duration: string
  canisterId?: string
}

export interface ITransferModalConnector
  extends StandardizedToken<TokenStandards> {
  getTokenConfig(currency?: string): ITransferConfig
  getTokenCurrencies(): Promise<string[]>
  getAccountsOptions({
    currency,
    isVault,
    isRootOnly,
  }: {
    currency?: string
    isVault?: boolean
    isRootOnly?: boolean
  }): Promise<IGroupedOptions[]>
  getRate(currency: string): Promise<number | undefined>

  getNetworkOption(): IGroupOption
  getTokensOptions(): Promise<IGroupedOptions>

  validateAddress(address: string): boolean | string
  transfer(
    request: ITransferFTRequest | ITransferNFTRequest,
  ): Promise<ITransferResponse>

  getIdentity(
    domain?: string,
    accountId?: string,
    targetCanisters?: string[],
  ): Promise<DelegationIdentity>
}

export type ITransferFTConnector = {
  getBalance(address?: string, currency?: string): Promise<bigint>
  getAddress(address?: string, identity?: DelegationIdentity): Promise<string>
  getFee(request: ITransferFTRequest | ITransferNFTRequest): Promise<bigint>
  getDecimals(currency?: string): Promise<number>
} & ITransferModalConnector

export type ITransferNFTConnector = {
  getNFTs(): Promise<UserNonFungibleToken[]>
  getNFTOptions(): Promise<IGroupedOptions[]>
  getFee(request: ITransferFTRequest | ITransferNFTRequest): Promise<bigint>
} & ITransferModalConnector

export type IUniversalConnector = ITransferFTConnector | ITransferNFTConnector

export type IGetConnector<T extends TransferModalType> = {
  type?: T
  currency?: string
  tokenStandard?: string
  blockchain: string
}

export type IConnector<T extends TransferModalType> =
  T extends TransferModalType.FT ? ITransferFTConnector : ITransferNFTConnector

export type TokenBalance = { balance: string; balanceinUsd?: string }

export type IConfirmEVMRequest = {
  cacheKey: string
}

export type ITransferRequest = {
  to: string
  memo?: bigint
  contract: string
  identity?: DelegationIdentity
  canisterId?: string
  fee?: bigint
}

export type ITransferFTRequest = {
  currency: string
  amount: number | bigint
} & ITransferRequest

export type ITransferNFTRequest = {
  tokenId: string
  standard: string
} & ITransferRequest

export interface ITransferResponse {
  verifyPromise?: Promise<void>
  errorMessage?: Error
  url?: string
  hash?: string
  blockIndex?: Icrc1BlockIndex
}

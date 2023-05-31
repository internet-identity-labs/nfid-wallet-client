import { DelegationIdentity } from "@dfinity/identity"
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
  shouldHavePrincipal?: boolean
  addressPlaceholder: string
  assetService?: FungibleAsset
  isNativeToken?: boolean
}

export interface ITransferModalConnector
  extends StandardizedToken<TokenStandards> {
  getTokenConfig(currency?: string): ITransferConfig
  getTokenCurrencies(): Promise<string[]>
  getAccountsOptions(currency?: string): Promise<IGroupedOptions[]>
  getRate(currency?: string): Promise<string>

  getNetworkOption(): IGroupOption
  getTokensOptions(): Promise<IGroupedOptions>
  shouldHavePrincipal(): boolean

  validateAddress(address: string): boolean | string
  transfer(
    request: ITransferFTRequest | ITransferNFTRequest,
  ): Promise<ITransferResponse>

  getIdentity(domain?: string, accountId?: string): Promise<DelegationIdentity>
}

export type ITransferFTConnector = {
  getBalance(address?: string, currency?: string): Promise<TokenBalance>
  getAddress(address?: string, identity?: DelegationIdentity): Promise<string>
  getFee(request: ITransferFTRequest | ITransferNFTRequest): Promise<TokenFee>
} & ITransferModalConnector

export type ITransferNFTConnector = {
  getNFTs(): Promise<UserNonFungibleToken[]>
  getNFTOptions(): Promise<IGroupedOptions[]>
  getFee(request: ITransferFTRequest | ITransferNFTRequest): Promise<TokenFee>
} & ITransferModalConnector

export type IUniversalConnector = ITransferFTConnector | ITransferNFTConnector

export type IGetConnector<T extends TransferModalType> = {
  type?: T
  currency?: string
  blockchain?: string
  tokenStandard?: string
}

export type IConnector<T extends TransferModalType> =
  T extends TransferModalType.FT ? ITransferFTConnector : ITransferNFTConnector

export type TokenBalance = { balance: string; balanceinUsd: string }
export type TokenFee = { fee: string; feeUsd: string }

export type IConfirmEVMRequest = {
  cacheKey: string
}

export type ITransferRequest = {
  to: string
  contract: string
  identity?: DelegationIdentity
}

export type ITransferFTRequest = {
  currency: string
  amount: number
} & ITransferRequest

export type ITransferNFTRequest = {
  tokenId: string
  standard: string
} & ITransferRequest

export interface ITransferResponse {
  verifyPromise?: Promise<void>
  errorMessage?: Error
  url?: string
}

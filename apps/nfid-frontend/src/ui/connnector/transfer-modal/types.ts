import { DelegationIdentity } from "@dfinity/identity"

import { IGroupOption, IGroupedOptions } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"

import { Blockchain, NativeToken, StandardizedToken } from "../types"

export type ITransferFTModalConfig = {
  type: string
  icon: string
  tokenStandard: TokenStandards
  blockchain: Blockchain
  title?: string
  isNativeToken?: boolean
  addressPlaceholder: string
  shouldHavePrincipal?: boolean
  feeCurrency?: NativeToken
}

export type ITransferFT20ModalConfig = {
  icon: string
  tokenStandard: TokenStandards
  blockchain: Blockchain
  title?: string
  isNativeToken?: boolean
  addressPlaceholder: string
  shouldHavePrincipal?: boolean
  feeCurrency?: NativeToken
  contractId?: string
  type: string
}

export type ITransferNFTModalConfig = {
  icon: string
  tokenStandard: TokenStandards
  blockchain: Blockchain
  addressPlaceholder: string
  supportNFT?: boolean
  shouldHavePrincipal?: boolean
  feeCurrency?: NativeToken
  type: string
}

export interface ITransferModalConnector
  extends StandardizedToken<TokenStandards> {
  getTokenConfig(
    currency?: string,
  ): ITransferFTModalConfig | ITransferNFTModalConfig | ITransferFT20ModalConfig
  getTokenCurrencies(): Promise<string[]>
  getAccountsOptions(currency?: string): Promise<IGroupedOptions[]>

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

export type ITransferFT20Connector = {
  getBalance(address?: string, currency?: string): Promise<TokenBalance>
  getAddress(address?: string, identity?: DelegationIdentity): Promise<string>
  getFee(request: ITransferFTRequest | ITransferNFTRequest): Promise<TokenFee>
} & ITransferModalConnector

export type ITransferNFTConnector = {
  getNFTs(): Promise<UserNonFungibleToken[]>
  getNFTOptions(): Promise<IGroupedOptions[]>
  getFee(request: ITransferFTRequest | ITransferNFTRequest): Promise<TokenFee>
} & ITransferModalConnector

export type IUniversalConnector =
  | ITransferFTConnector
  | ITransferNFTConnector
  | ITransferFT20Connector

export type IConnectorType = "ft" | "nft"
export type IGetConnector<T extends IConnectorType> = {
  type?: T
  currency?: string
  blockchain?: string
  tokenStandard?: string
}

export type IConnector<T extends IConnectorType> = T extends "ft"
  ? ITransferFTConnector | ITransferFT20Connector
  : ITransferNFTConnector

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
  status: "ok" | "error"
  errorMessage?: string
  successMessage?: string
  hash?: string
}

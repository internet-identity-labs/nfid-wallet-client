import {
  TokenBalanceSheet,
  TransferResponse,
} from "packages/integration/src/lib/asset/types"

import { NonFungibleAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"

export type IFungibleAssetConnector = StandardizedToken<string> & {
  getTokenConfigs(assetFilter: AssetFilter[]): Promise<Array<TokenConfig>>
}

export type INonFungibleAssetConnector = StandardizedToken<string> & {
  getNonFungibleItems(
    assetFilter: AssetFilter[],
  ): Promise<Array<UserNonFungibleToken>>
}

export type IFungibleAssetDetailsConnector = StandardizedToken<string> & {
  getAssetDetails(): Promise<Array<TokenBalanceSheet>>
}

export type StandardizedToken<T> = {
  getTokenStandard(): T
}

export type NftConnectorConfig = {
  defaultLogo: string
  blockchain: Blockchain
  assetService: NonFungibleAsset<TransferResponse>
}

export type TokenDetailsConfig = {
  blockchain: Blockchain
  tokenStandard: TokenStandards
  icon: string
}

export type AssetNativeConfig = {
  title: string
  tokenStandard: TokenStandards
  blockchain: Blockchain
  icon: string
  feeCurrency: NativeToken
}

export enum Blockchain {
  IC = "Internet Computer",
}

export enum NativeToken {
  ICP = "ICP",
}

export interface TokenConfig {
  balance: bigint | undefined
  currency: string
  fee: bigint
  icon: string
  rate: number | undefined
  decimals: number
  title: string
  canisterId?: string
  tokenStandard: TokenStandards
  toPresentation: (value?: bigint) => number | string
  transformAmount: (value: string) => number
  blockchain: Blockchain
  feeCurrency?: string
  contract?: string
}

export interface AssetFilter {
  principal: string
  accountId: string
}

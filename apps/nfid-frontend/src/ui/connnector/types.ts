import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"

import { TokenStandards } from "@nfid/integration/token/types"

export type IFungibleAssetConnector = StandardizedToken & {
  getTokenConfigs(assetFilter: AssetFilter[]): Promise<Array<TokenConfig>>
}

export type IFungibleAssetDetailsConnector = StandardizedToken & {
  getAssetDetails(): Promise<Array<TokenBalanceSheet>>
}

export type StandardizedToken = {
  getTokenStandard(): TokenStandards
}

export type TokenDetailsConfig = {
  tokenStandard: TokenStandards
  icon: string
}

export type AssetErc20Config = {
  tokenStandard: TokenStandards
  icon: string
  blockchain: Blockchain
  feeCurrency: NativeToken
}

export type AssetNativeConfig = AssetErc20Config & {
  title: string
}

export enum Blockchain {
  ETHEREUM = "Ethereum",
  POLYGON = "Polygon",
  IC = "Internet Computer",
  BITCOIN = "Bitcoin",
}

export enum NativeToken {
  ETH = "ETH",
  MATIC = "MATIC",
  ICP = "ICP",
  BTC = "BTC",
}

export interface TokenConfig {
  balance: bigint | undefined
  currency: string
  fee: bigint
  icon: string
  price: string | undefined
  title: string
  canisterId?: string
  tokenStandard: TokenStandards
  toPresentation: (value?: bigint) => number
  transformAmount: (value: string) => number
  blockchain: string
  feeCurrency?: string
  contract?: string
}

export interface AssetFilter {
  principal: string
}

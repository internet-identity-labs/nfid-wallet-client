import {
  TokenBalanceSheet,
  TransferResponse,
} from "packages/integration/src/lib/asset/types"
import { UserNonFungibleToken } from "src/features/non-fungable-token/types"

import { NonFungibleAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

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

export type AssetErc20Config = {
  network: Network
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
  POLYGON_MUMBAI = "Polygon Mumbai",
  IC = "Internet Computer",
  BITCOIN = "Bitcoin",
}

export enum NativeToken {
  ETH = "ETH",
  MATIC = "MATIC",
  ICP = "ICP",
  BTC = "BTC",
}

export enum ETHNetwork {
  MAINNET = "",
}

export enum PolygonNetwork {
  MAINNET = "",
  MUMBAI = "Mumbai",
}

export enum BTCNetwork {
  MAINNET = "",
  TESTNET = "Testnet",
}

export type Network = ETHNetwork | PolygonNetwork | BTCNetwork
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
  blockchain: Blockchain
  feeCurrency?: string
  contract?: string
}

export interface AssetFilter {
  principal: string
  accountId: string
}

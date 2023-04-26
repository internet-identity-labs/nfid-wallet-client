import { TokenStandards } from "@nfid/integration/token/types"

export interface FungibleAssetViewI {
  getTokenConfigs(): Promise<Array<TokenConfig>>
  getTokenStandard(): TokenStandards
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

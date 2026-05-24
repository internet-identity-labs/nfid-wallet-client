import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export interface AaveReserveData {
  liquidityIndex: bigint
  currentLiquidityRate: bigint
  aTokenAddress: string
  variableDebtTokenAddress: string
}

export interface AaveUserPosition {
  chainId: ChainId
  asset: string
  aTokenAddress: string
  symbol: string
  balance: bigint
  balanceFormatted: string
  decimals: number
  supplyAPY: number
}

export interface AaveSupplyParams {
  chainId: ChainId
  asset: string
  amount: string
  isNativeToken: boolean
}

export interface AaveWithdrawParams {
  chainId: ChainId
  asset: string
  amount: string
  isNativeToken: boolean
}

export interface AaveSupplyFee {
  gasUsed: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  networkFee: bigint
}

export type AaveSupportedChainId =
  | ChainId.ETH
  | ChainId.POL
  | ChainId.ARB
  | ChainId.BASE

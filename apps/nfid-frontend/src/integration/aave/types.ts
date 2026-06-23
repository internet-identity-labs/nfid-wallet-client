import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export interface AaveReserveData {
  liquidityIndex: bigint
  currentLiquidityRate: bigint
  aTokenAddress: string
  variableDebtTokenAddress: string
}

export interface AaveUserPosition {
  chainId: AaveSupportedChainId
  asset: string
  aTokenAddress: string
  symbol: string
  balance: bigint
  balanceFormatted: string
  balanceUsdFormatted: string
  decimals: number
  supplyAPY: string
}

export interface AaveSupplyParams {
  chainId: AaveSupportedChainId
  asset: string
  amount: string
  isNativeToken: boolean
}

export interface AaveWithdrawParams extends AaveSupplyParams {}

export interface AaveSupplyFee {
  gasUsed: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  networkFee: bigint
}

export interface AaveWithdrawFee extends AaveSupplyFee {}

export type AaveSupportedChainId =
  | ChainId.ETH
  | ChainId.POL
  | ChainId.ARB
  | ChainId.BASE

export interface AaveFeeFormatted {
  fee: string
  feeUsd: string
}

export interface AaveFeeData {
  rawFee: AaveSupplyFee | AaveWithdrawFee
  feeFormatted: AaveFeeFormatted
  adjustedAmount?: string
}

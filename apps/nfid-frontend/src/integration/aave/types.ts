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
  /** Current aToken balance = principal + accrued interest */
  balance: bigint
  balanceFormatted: string
  /** Original supplied amount (principal) */
  supplied: bigint
  suppliedFormatted: string
  /** Accrued interest = balance − supplied */
  earned: bigint
  earnedFormatted: string
  decimals: number
  supplyAPY: number
}

/**
 * Stored when the user calls supply() so we can recover the original
 * principal on the next getUserPositions() call.
 * key: `${chainId}:${asset}:${userAddress}`
 */
export interface AaveSupplySnapshot {
  scaledBalance: string // bigint serialised as decimal string
  liquidityIndex: string // RAY-scaled bigint serialised as decimal string
}

export interface AaveSupplyParams {
  chainId: AaveSupportedChainId
  asset: string
  amount: string
  isNativeToken: boolean
}

export interface AaveWithdrawParams {
  chainId: AaveSupportedChainId
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

export interface TokenValue {
  getTokenValue(): string
  getUSDValue(): string
}

export interface StakingParams {
  fee: {
    fee: string
    feeInUsd?: string
  }
  minStakeAmount: number
  maxPeriod: number
  minPeriod: number
}

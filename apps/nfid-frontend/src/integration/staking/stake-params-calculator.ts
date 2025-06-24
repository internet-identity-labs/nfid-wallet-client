import { TokenValue } from "./types"

export interface StakeParamsCalculator {
  getFee(): bigint | undefined
  getFeeFormatted(): TokenValue
  getMinimumToStake(): number
  getMinimumLockTime(): number
  getMinimumLockTimeInMonths(): number
  getMaximumLockTime(): number
  getMaximumLockTimeInMonths(): number
}

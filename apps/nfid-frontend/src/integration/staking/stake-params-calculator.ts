import { TokenValue } from "./types"

export interface StakeParamsCalculator {
  getFee(): TokenValue
  getMinimumToStake(): number
  getMinimumLockTime(): number
  getMinimumLockTimeInMonths(): number
  getMaximumLockTime(): number
  getMaximumLockTimeInMonths(): number
  calculateProjectRewards(
    amount: string,
    lockValueInMonths: number,
  ): Promise<TokenValue | undefined>
  calculateEstAPR(
    lockValueInMonths: number,
    lockValue: number,
  ): Promise<string | undefined>
}

import { TokenValue } from "./types"

export interface StakeParamsCalculator {
  getFee(): TokenValue
  getMinimumToStake(): number
  getMinimumLockTime(): number
  getMinimumLockTimeInMonths(): number
  getMaximumLockTime(): number
  getMaximumLockTimeInMonths(): number
  calculateProjectRewards(amount: string, lockTime: number): Promise<string>
  calculateEstAPR(amount: string, lockTime: number): Promise<string>
}

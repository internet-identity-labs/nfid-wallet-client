import { FT } from "src/integration/ft/ft"

export interface StakeAprCalculator {
  setFt(token: FT): Promise<void>
  getMinimumToStake(): number
  getMinimumLockTime(): number
  getMaximumLockTime(): number
  calculateProjectRewards(amount: string, lockTime: number): Promise<string>
  calculateEstAPR(amount: string, lockTime: number): Promise<string>
}

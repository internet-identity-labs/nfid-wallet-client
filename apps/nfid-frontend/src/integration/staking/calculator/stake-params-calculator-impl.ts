import { FT } from "frontend/integration/ft/ft"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import { TokenValue } from "../types"

const SECONDS_IN_MONTH = (60 * 60 * 24 * 365.25) / 12

export abstract class StakeParamsCalculatorImpl<T>
  implements StakeParamsCalculator
{
  protected token: FT
  protected params: T

  constructor(ft: FT, params: T) {
    this.token = ft
    this.params = params
  }

  abstract getFee(): bigint | undefined

  abstract getMinimumToStake(): number

  abstract getMinimumLockTime(): number

  abstract getMaximumLockTime(): number

  getFeeFormatted(): TokenValue {
    const fee = Number(this.getFee()) / 10 ** this.token.getTokenDecimals()
    return {
      getTokenValue: () => `${fee} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(fee.toString()) || "Not listed",
    }
  }

  getMinimumLockTimeInMonths(): number {
    return Math.round(
      this.getMinimumLockTime() / ((60 * 60 * 24 * 365.25) / 12),
    )
  }

  getMaximumLockTimeInMonths(): number {
    return Math.round(this.getMaximumLockTime() / SECONDS_IN_MONTH)
  }

  async calculateProjectRewards(
    amount: string,
    lockTime: number,
  ): Promise<string> {
    // This method is not implemented yet
    return (Number(amount) + lockTime).toString()
  }

  async calculateEstAPR(amount: string, lockTime: number): Promise<string> {
    // This method is not implemented yet
    return (Number(amount) + lockTime).toString()
  }
}

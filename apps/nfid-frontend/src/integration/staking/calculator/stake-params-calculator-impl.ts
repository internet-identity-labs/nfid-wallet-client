import { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance"

import { FT } from "frontend/integration/ft/ft"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import { TokenValue } from "../types"

const SECONDS_IN_MONTH = (60 * 60 * 24 * 365.25) / 12

export class StakeParamsCalculatorImpl implements StakeParamsCalculator {
  token: FT
  params: NervousSystemParameters

  constructor(ft: FT, params: NervousSystemParameters) {
    this.token = ft
    this.params = params
  }

  getFee(): TokenValue {
    const fee =
      Number(this.params.transaction_fee_e8s[0]) /
      10 ** this.token.getTokenDecimals()
    return {
      getTokenValue: () => `${fee} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(fee.toString()) || "Not listed",
    }
  }

  getMinimumToStake(): number {
    return (
      Number(this.params.neuron_minimum_stake_e8s[0]) /
      10 ** this.token.getTokenDecimals()
    )
  }

  getMinimumLockTime(): number {
    return Number(this.params.neuron_minimum_dissolve_delay_to_vote_seconds)
  }

  getMinimumLockTimeInMonths(): number {
    return Math.round(
      this.getMinimumLockTime() / ((60 * 60 * 24 * 365.25) / 12),
    )
  }

  getMaximumLockTime(): number {
    return Number(this.params.max_dissolve_delay_seconds)
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

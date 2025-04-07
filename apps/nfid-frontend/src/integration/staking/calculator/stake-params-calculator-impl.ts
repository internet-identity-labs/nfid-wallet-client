import { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance"

import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import { TokenValue } from "../types"

const SECONDS_IN_MONTH = (60 * 60 * 24 * 365.25) / 12

export class StakeParamsCalculatorImpl implements StakeParamsCalculator {
  private icpDashboardData: {
    dailyRewardsPerVotingPowerUnit: number
  } | null = null
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
    lockValueInMonths: number,
  ): Promise<TokenValue | undefined> {
    const data = await this.getIcpDashboardData()
    if (data === undefined) return

    const dissolveDelayBonusSlider =
      1 + lockValueInMonths / 12 / this.getMaximumLockTimeInMonths() / 12

    const dissolveDelayBonusActual =
      1 +
      (Number(this.params.max_dissolve_delay_bonus_percentage[0]) ?? 0) / 100

    const votingPowerE8s = 350000000 // ???

    const estimatedNeuronDailyRewards =
      ((votingPowerE8s / 10 ** this.token.getTokenDecimals()) *
        data.dailyRewardsPerVotingPowerUnit *
        dissolveDelayBonusSlider) /
      dissolveDelayBonusActual

    const value = (estimatedNeuronDailyRewards * lockValueInMonths * 30)
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => `${value} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(value) || "Not listed",
    }
  }

  async calculateEstAPR(
    lockValueInMonths: number,
    lockValue: number,
  ): Promise<string | undefined> {
    const data = await this.getIcpDashboardData()
    if (data === undefined) return

    const dissolveDelayBonusSlider =
      1 + lockValueInMonths / (this.getMaximumLockTimeInMonths() / 12)

    const ageBonus =
      1 +
      Math.min(lockValue, Number(this.params.max_neuron_age_for_age_bonus[0])) /
        Number(this.params.max_neuron_age_for_age_bonus[0]) /
        4

    const estimatedRewardsIcpPerVotingPowerUnit: number =
      data.dailyRewardsPerVotingPowerUnit * dissolveDelayBonusSlider * ageBonus

    return `${(estimatedRewardsIcpPerVotingPowerUnit * 365.25 * 100).toFixed(
      2,
    )}%`
  }

  private async getIcpDashboardData(): Promise<
    | {
        dailyRewardsPerVotingPowerUnit: number
      }
    | undefined
  > {
    if (this.icpDashboardData) return this.icpDashboardData

    try {
      const response = await fetch(
        "https://ic-api.internetcomputer.org/api/v3/governance-metrics",
      )

      const data = await response.json()

      const latestRewards =
        Number(
          data.metrics.find(
            (element: any) =>
              element.name ===
              "governance_latest_reward_round_total_available_e8s",
          ).subsets[0].value[1],
        ) /
        10 ** this.token.getTokenDecimals()

      const votingPower: any =
        Number(
          data.metrics.find(
            (element: any) => element.name === "governance_voting_power_total",
          ).subsets[0].value[1],
        ) /
        10 ** this.token.getTokenDecimals()

      this.icpDashboardData = {
        dailyRewardsPerVotingPowerUnit: latestRewards / votingPower,
      }

      return this.icpDashboardData
    } catch (e) {
      console.error("ICP Dahsboard Error: ", e)
    }
  }
}

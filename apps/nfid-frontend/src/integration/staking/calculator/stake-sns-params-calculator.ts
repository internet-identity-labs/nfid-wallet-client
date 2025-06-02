import { SnsNervousSystemParameters } from "@dfinity/sns"

import { StakeParamsCalculatorImpl } from "./stake-params-calculator-impl"

export class StakeSnsParamsCalculatorImpl extends StakeParamsCalculatorImpl<SnsNervousSystemParameters> {
  getFee(): bigint | undefined {
    return this.params.transaction_fee_e8s[0]
  }

  getMinimumToStake(): number {
    return (
      Number(this.params.neuron_minimum_stake_e8s[0]) /
      10 ** this.token.getTokenDecimals()
    )
  }

  getMinimumLockTime(): number {
    return Number(this.params.neuron_minimum_dissolve_delay_to_vote_seconds[0])
  }

  getMaximumLockTime(): number {
    return Number(this.params.max_dissolve_delay_seconds[0])
  }
}

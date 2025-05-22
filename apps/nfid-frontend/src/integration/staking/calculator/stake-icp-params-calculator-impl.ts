import { NetworkEconomics } from "@dfinity/nns"

import { StakeParamsCalculatorImpl } from "./stake-params-calculator-impl"

const EIGHT_YEARS = 252460800

export class StakeICPParamsCalculatorImpl extends StakeParamsCalculatorImpl<NetworkEconomics> {
  getFee(): bigint | undefined {
    return this.params.transactionFee
  }

  getMinimumToStake(): number {
    return (
      Number(this.params.neuronMinimumStake) /
      10 ** this.token.getTokenDecimals()
    )
  }

  getMinimumLockTime(): number {
    return Number(
      this.params.votingPowerEconomics!.neuronMinimumDissolveDelayToVoteSeconds,
    )
  }

  getMaximumLockTime(): number {
    return Number(BigInt(EIGHT_YEARS))
  }
}

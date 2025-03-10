import { RedeemCalculator } from "src/integration/staking/redeem-calculator"

import { NFIDNeuron } from "../nfid-neuron"

export class RedeemCalculatorImpl implements RedeemCalculator {
  setNeuron(neuron: NFIDNeuron): Promise<void> {
    throw new Error("Method not implemented.")
  }
  getInitialStake(): string {
    throw new Error("Method not implemented.")
  }
  getReward(): string {
    throw new Error("Method not implemented.")
  }
  getProtocolFee(): string {
    throw new Error("Method not implemented.")
  }
  getTotalRedemption(): string {
    throw new Error("Method not implemented.")
  }
}

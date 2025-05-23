import { NFIDNeuron } from "src/integration/staking/nfid-neuron"

import { StakedTokenImpl } from "./staked-token-impl"

export class StakedSnsTokenImpl extends StakedTokenImpl {
  getAvailable(): NFIDNeuron[] {
    return this.neurons.filter((neuron) => {
      const lockTime = neuron.getLockTime()

      return (
        lockTime !== undefined &&
        lockTime + neuron.getCreatedAt() <= Math.floor(Date.now() / 1000) &&
        // TODO: research why the redeemed stakes are not deleted
        Number(neuron.getInitialStake()) > 0
      )
    })
  }

  getUnlocking(): NFIDNeuron[] {
    return this.neurons.filter((neuron) => neuron.getUnlockIn())
  }

  getLocked(): NFIDNeuron[] {
    return this.neurons.filter((neuron) => {
      const lockTime = neuron.getLockTime()

      return (
        lockTime !== undefined &&
        lockTime + neuron.getCreatedAt() > Math.floor(Date.now() / 1000)
      )
    })
  }
}

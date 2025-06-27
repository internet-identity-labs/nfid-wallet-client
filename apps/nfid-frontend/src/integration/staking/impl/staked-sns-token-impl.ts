import { NFIDNeuron } from "src/integration/staking/nfid-neuron"

import { StakedTokenImpl } from "./staked-token-impl"

export class StakedSnsTokenImpl extends StakedTokenImpl {
  getAvailable(): NFIDNeuron[] {
    const now = Math.floor(Date.now() / 1000)

    return this.neurons.filter((neuron) => {
      const unlockTimestamp = neuron.getUnlockIn()
      return (
        typeof unlockTimestamp === "number" &&
        unlockTimestamp <= now &&
        Number(neuron.getInitialStake()) > 0
      )
    })
  }

  getUnlocking(): NFIDNeuron[] {
    const now = Math.floor(Date.now() / 1000)

    return this.neurons.filter((neuron) => {
      const unlockTimestamp = neuron.getUnlockIn()
      return typeof unlockTimestamp === "number" && unlockTimestamp > now
    })
  }

  getLocked(): NFIDNeuron[] {
    return this.neurons.filter((neuron) => {
      const unlockTimestamp = neuron.getUnlockIn()
      return (
        unlockTimestamp === undefined && Number(neuron.getInitialStake()) > 0
      )
    })
  }
}

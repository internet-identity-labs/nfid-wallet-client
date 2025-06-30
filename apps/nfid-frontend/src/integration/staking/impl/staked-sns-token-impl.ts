import { NFIDNeuron } from "src/integration/staking/nfid-neuron"

import { StakedTokenImpl } from "./staked-token-impl"

export class StakedSnsTokenImpl extends StakedTokenImpl {
  getAvailable(): NFIDNeuron[] {
    const now = Math.floor(Date.now() / 1000)

    const aa = this.neurons.filter((neuron) => {
      return (
        neuron.getIsDissolving() &&
        neuron.getUnlockIn() !== undefined &&
        neuron.getUnlockIn()! <= now &&
        Number(neuron.getInitialStake()) > 0
      )
    })
    console.log("wowowo getAvailable", aa)
    return aa
  }

  getUnlocking(): NFIDNeuron[] {
    const now = Math.floor(Date.now() / 1000)

    const aa = this.neurons.filter((neuron) => {
      return (
        neuron.getIsDissolving() &&
        neuron.getUnlockIn() !== undefined &&
        neuron.getUnlockIn()! > now
      )
    })
    console.log("wowowo getUnlocking", aa)
    return aa
  }

  getLocked(): NFIDNeuron[] {
    const aa = this.neurons.filter(
      (neuron) =>
        !neuron.getIsDissolving() && Number(neuron.getInitialStake()) > 0,
    )

    console.log("wowowo getLocked", aa)
    return aa
  }
}

import { NeuronState } from "@dfinity/nns"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"

import { StakedTokenImpl } from "./staked-token-impl"

export class StakedICPTokenImpl extends StakedTokenImpl {
  getAvailable(): NFIDNeuron[] {
    return this.neurons.filter(
      (neuron) => neuron.getState() === NeuronState.Dissolved,
    )
  }

  getUnlocking(): NFIDNeuron[] {
    return this.neurons.filter(
      (neuron) => neuron.getState() === NeuronState.Dissolving,
    )
  }

  getLocked(): NFIDNeuron[] {
    return this.neurons.filter(
      (neuron) => neuron.getState() === NeuronState.Locked,
    )
  }
}

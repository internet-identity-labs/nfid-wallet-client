import {NFIDNeuron} from "src/integration/staking/nfid-neuron";

export interface RedeemCalculator {
  setNeuron(neuron:NFIDNeuron) :  Promise<void>
  getInitialStake(): string
  getReward(): string
  getProtocolFee(): string
  getTotalRedemption(): string
}

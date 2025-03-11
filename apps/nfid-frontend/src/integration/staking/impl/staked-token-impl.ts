import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakedToken } from "src/integration/staking/staked-token"
import { TokenValue } from "src/integration/staking/types/token-value"

import { FT } from "frontend/integration/ft/ft"

export class StakedTokenImpl implements StakedToken {
  token: FT
  neurons: Array<NFIDNeuron>

  constructor(token: FT, neurons: Array<NFIDNeuron>) {
    this.token = token
    this.neurons = neurons
  }

  getStaked(): TokenValue {
    throw new Error("Method not implemented.")
  }

  getRewards(): TokenValue {
    throw new Error("Method not implemented.")
  }

  getStakingBalance(): TokenValue {
    throw new Error("Method not implemented.")
  }

  getToken(): FT {
    throw new Error("Method not implemented.")
  }

  isDiamond(): boolean {
    throw new Error("Method not implemented.")
  }

  getAvailable(): Array<NFIDNeuron> {
    throw new Error("Method not implemented.")
  }

  getUnlocking(): Array<NFIDNeuron> {
    throw new Error("Method not implemented.")
  }

  getLocked(): Array<NFIDNeuron> {
    throw new Error("Method not implemented.")
  }
}

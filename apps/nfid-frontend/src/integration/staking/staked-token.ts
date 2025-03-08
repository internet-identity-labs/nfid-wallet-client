import { FT } from "src/integration/ft/ft"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { TokenValue } from "src/integration/staking/types/token-value"

export interface StakedToken {
  getToken(): FT
  getStaked(): TokenValue
  getRewards(): TokenValue
  getStakingBalance(): TokenValue
  isDiamond(): boolean
  getAvailable(): Array<NFIDNeuron>
  getUnlocking(): Array<NFIDNeuron>
  getLocked(): Array<NFIDNeuron>
}

import { FT } from "src/integration/ft/ft"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"

import { TokenValue } from "frontend/integration/staking/types"

export interface StakedToken {
  getToken(): FT
  getStaked(): bigint
  getStakedFormatted(): TokenValue
  getRewards(): bigint
  getRewardsFormatted(): TokenValue
  getStakingBalance(): bigint
  getStakingBalanceFormatted(): TokenValue
  isDiamond(): boolean
  getAvailable(): Array<NFIDNeuron>
  getUnlocking(): Array<NFIDNeuron>
  getLocked(): Array<NFIDNeuron>
}

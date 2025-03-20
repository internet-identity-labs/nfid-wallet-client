import { SignIdentity } from "@dfinity/agent"
import { FT } from "src/integration/ft/ft"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakedToken } from "src/integration/staking/staked-token"

import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

export interface StakingService {
  getStakedTokens(
    userId: SignIdentity,
    publicKey: string,
  ): Promise<Array<StakedToken>>
  //user global identity
  getStaked(): string
  getRewards(): string
  getStakingBalance(): string
  getStakeCalculator(
    token: FT,
    delegation: SignIdentity,
  ): Promise<StakeParamsCalculator | undefined>
  //global sign identity
  stake(
    token: FT,
    amount: string,
    delegation: SignIdentity,
    lockTime?: number,
  ): Promise<NFIDNeuron>
}

import { SignIdentity } from "@dfinity/agent"
import { NeuronId } from "@dfinity/nns-proto"
import { FT } from "src/integration/ft/ft"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakeAprCalculator } from "src/integration/staking/stake-apr-calculator"
import { StakedToken } from "src/integration/staking/staked-token"

export interface StakingService {
  getStakedTokens(
    userId: string,
    publicKey: string,
  ): Promise<Array<StakedToken>>
  getStaked(): string
  getRewards(): string
  getStakingBalance(): string
  getStakeCalculator(token: FT): StakeAprCalculator
  //global sign identity
  stake(
    token: FT,
    amount: string,
    delegation: SignIdentity,
  ): Promise<NFIDNeuron>
}

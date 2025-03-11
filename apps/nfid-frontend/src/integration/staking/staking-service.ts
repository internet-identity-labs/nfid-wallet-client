import { FT } from "src/integration/ft/ft"
import { StakeAprCalculator } from "src/integration/staking/stake-apr-calculator"
import { StakedToken } from "src/integration/staking/staked-token"
import {SignIdentity} from "@dfinity/agent";
import {NeuronId} from "@dfinity/nns-proto";
import {NFIDNeuron} from "src/integration/staking/nfid-neuron";

export interface StakingService {
  getStakedTokens(userId: string): Promise<Array<StakedToken>>
  getStaked(): string
  getRewards(): string
  getStakingBalance(): string
  getStakeCalculator(token: FT): StakeAprCalculator
  //global sign identity
  stake(token: FT, amount: string, delegation: SignIdentity): Promise<NFIDNeuron>
}

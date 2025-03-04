import {FT} from "src/integration/ft/ft";
import { StakedToken} from "src/integration/staking/staked-token";
import {StakeAprCalculator} from "src/integration/staking/stake-apr-calculator";

export interface StakingService {
  getStakedTokens(): Promise<Array<StakedToken>>
  getStaked(): string
  getRewards(): string
  getStakingBalance(): string
  getStakeCalculator(token:FT) : StakeAprCalculator
  stake(token: FT, amount: string): Promise<StakedToken>
}

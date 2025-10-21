import { SignIdentity } from "@dfinity/agent"
import { FT } from "src/integration/ft/ft"
import { StakedToken } from "src/integration/staking/staked-token"

import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import { TotalBalance } from "./types"

export interface StakingService {
  getStakedTokens(
    identity: Promise<SignIdentity>,
    tokens: FT[],
    refetch?: boolean,
  ): Promise<Array<StakedToken> | undefined>
  getTotalBalances(stakedToken: StakedToken[]): TotalBalance | undefined
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
  ): Promise<{
    id: Uint8Array | number[]
  }>
}

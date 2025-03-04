import { FT } from "frontend/integration/ft/ft";
import { StakedToken,} from "../staked-token";
import {StakingService} from "src/integration/staking/staking-service";
import {StakeAprCalculator} from "src/integration/staking/stake-apr-calculator";

export class StakingServiceImpl implements StakingService {

  getStakedTokens(): Promise<Array<StakedToken>> {
        throw new Error("Method not implemented.");
    }
    getStaked(): string {
        throw new Error("Method not implemented.");
    }
    getRewards(): string {
        throw new Error("Method not implemented.");
    }
    getStakingBalance(): string {
        throw new Error("Method not implemented.");
    }
    getStakeCalculator(token: FT): StakeAprCalculator {
        throw new Error("Method not implemented.");
    }
    stake(token: FT, amount: string): Promise<StakedToken> {
        throw new Error("Method not implemented.");
    }

}

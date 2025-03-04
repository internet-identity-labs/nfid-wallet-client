import { FT } from "frontend/integration/ft/ft";
import {StakeAprCalculator} from "src/integration/staking/stake-apr-calculator";

export class StakeAprCalculatorImpl implements StakeAprCalculator {
    setFt(token: FT): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getMinimumToStake(): number {
        throw new Error("Method not implemented.");
    }
    getMinimumLockTime(): number {
        throw new Error("Method not implemented.");
    }
    getMaximumLockTime(): number {
        throw new Error("Method not implemented.");
    }
    calculateProjectRewards(amount: string, lockTime: number): Promise<string> {
        throw new Error("Method not implemented.");
    }
    calculateEstAPR(amount: string, lockTime: number): Promise<string> {
        throw new Error("Method not implemented.");
    }

}

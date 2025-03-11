import { TokenValue } from "src/integration/staking/types/token-value"
import {SignIdentity} from "@dfinity/agent";

export interface NFIDNeuron {
  getStakeId(): string
  getInitialStake(): TokenValue
  getRewards(): TokenValue
  getTotalValue(): string
  getLockTime(): number
  getUnlockIn(): number
  getCreatedAt(): number
  startUnlocking(): Promise<void>
  stopUnlocking(): Promise<void>
  redeem(signIdentity: SignIdentity): Promise<void>
}

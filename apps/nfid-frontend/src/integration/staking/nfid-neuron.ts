import { SignIdentity } from "@dfinity/agent"
import {
  FormattedDate,
  TokenValue,
} from "src/integration/staking/types/token-value"

import { FT } from "../ft/ft"

export interface NFIDNeuron {
  getToken(): FT
  getStakeId(): string
  getInitialStake(): bigint
  getInitialStakeFormatted(): TokenValue
  getRewards(): bigint
  getRewardsFormatted(): TokenValue
  getTotalValue(): bigint
  getTotalValueFormatted(): TokenValue
  getLockTime(): number
  getLockTimeInMonths(): number
  getUnlockIn(): number
  getUnlockInFormatted(): FormattedDate
  getCreatedAt(): number
  getCreatedAtFormatted(): FormattedDate
  startUnlocking(): Promise<void>
  stopUnlocking(): Promise<void>
  redeem(signIdentity: SignIdentity): Promise<void>
}

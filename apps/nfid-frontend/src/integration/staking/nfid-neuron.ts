import { SignIdentity } from "@dfinity/agent"

import { FT } from "../ft/ft"
import { FormattedDate, TokenValue } from "./types"

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
  isDiamond(): boolean
  redeem(signIdentity: SignIdentity): Promise<void>
}

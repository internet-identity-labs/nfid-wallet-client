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
  getLockTime(): number | undefined
  getLockTimeInMonths(): number | undefined
  getUnlockIn(): number | undefined
  getUnlockInMonths(): number
  getUnlockInFormatted(): FormattedDate
  getCreatedAt(): number
  getCreatedAtFormatted(): FormattedDate
  startUnlocking(signIdentity: SignIdentity): Promise<void>
  stopUnlocking(signIdentity: SignIdentity): Promise<void>
  isDiamond(): boolean
  redeem(signIdentity: SignIdentity): Promise<void>
}

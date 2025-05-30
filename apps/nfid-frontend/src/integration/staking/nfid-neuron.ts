import { SignIdentity } from "@dfinity/agent"
import { NeuronState } from "@dfinity/nns"
import { Followees, NeuronId } from "@dfinity/sns/dist/candid/sns_governance"

import { FT } from "../ft/ft"
import { FormattedDate, TokenValue } from "./types"

export interface NFIDNeuron {
  getFollowees(): [bigint, Followees][]
  getToken(): FT
  getState(): NeuronState
  getStakeId(): NeuronId | bigint
  getStakeIdFormatted(): string
  getInitialStake(): bigint
  getInitialStakeFormatted(): TokenValue
  getRewards(): bigint
  getRewardsFormatted(): TokenValue
  getTotalValue(): bigint
  getTotalValueFormatted(): TokenValue
  getProtocolFee(): bigint
  getProtocolFeeFormatted(): TokenValue
  getLockTime(): number | undefined
  getLockTimeInMonths(): number | undefined
  getUnlockIn(): number | undefined
  getUnlockInPast(): FormattedDate | undefined
  getUnlockInMonths(): string | undefined
  getUnlockInFormatted(): FormattedDate | undefined
  getCreatedAt(): number
  getCreatedAtFormatted(): FormattedDate
  startUnlocking(signIdentity: SignIdentity): Promise<void>
  stopUnlocking(signIdentity: SignIdentity): Promise<void>
  isDiamond(): boolean
  redeem(signIdentity: SignIdentity): Promise<void>
}

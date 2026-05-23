import { SignIdentity } from "@icp-sdk/core/agent"
import { NeuronState, Followees as IcpFollowees } from "@icp-sdk/canisters/nns"
import { type SnsGovernanceDid } from "@icp-sdk/canisters/sns"
type Followees = SnsGovernanceDid.Followees
type NeuronId = SnsGovernanceDid.NeuronId

import { FT } from "../ft/ft"
import { FormattedDate, TokenValue } from "./types"

export interface NFIDNeuron {
  getFollowees(): [bigint, Followees][] | IcpFollowees[]
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
  getUnlockInMonths(): string | undefined
  getUnlockInFormatted(): FormattedDate | undefined
  getCreatedAt(): number
  getCreatedAtFormatted(): FormattedDate
  startUnlocking(signIdentity: SignIdentity): Promise<void>
  stopUnlocking(signIdentity: SignIdentity): Promise<void>
  isDiamond(): boolean
  serialize(): unknown
  redeem(signIdentity: SignIdentity): Promise<void>
}

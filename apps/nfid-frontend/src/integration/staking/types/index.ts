import { Topic } from "@icp-sdk/canisters/nns"
import { type SnsGovernanceDid } from "@icp-sdk/canisters/sns"
type ListNervousSystemFunctionsResponse =
  SnsGovernanceDid.ListNervousSystemFunctionsResponse

export interface TokenValue {
  getTokenValue(): string
  getUSDValue(): string
}

export interface FormattedDate {
  getDate(): string
  getTime(): string
}

export enum StakingState {
  Available = "Available",
  Unlocking = "Unlocking",
  Locked = "Locked",
}

export interface TotalBalance {
  staked: string
  rewards: string
  total: string
}

export type IStakingDelegates = ListNervousSystemFunctionsResponse

export type IStakingICPDelegates = Partial<Record<Topic, string>>

export type IFollowees = {
  name: string | undefined
  id: string
}[]

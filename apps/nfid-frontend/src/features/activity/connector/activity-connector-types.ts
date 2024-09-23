import { DelegationIdentity } from "@dfinity/identity"
import { Activity } from "packages/integration/src/lib/asset/types"

import { Blockchain, TokenStandards } from "@nfid/integration/token/types"

import { IActivityRow, IActivityRowGroup } from "../types"

export interface IActivityDetails {}
export interface IActivityConfig {
  network: Blockchain
  tokenStandard: TokenStandards
}

export interface IActivityConnector {
  config: IActivityConfig
  getBlockchain(): Blockchain
  getActivities(filteredContracts?: string[]): Promise<Activity[]>
  mapActivitiesToRows(
    activities: Activity[],
    config: IActivityConfig,
  ): IActivityRow[]
  getActivitiesRows(filteredContracts: string[]): Promise<IActivityRow[]>
  getIdentity(): DelegationIdentity
}

export interface GetAllActivityParams {
  filteredContracts: string[]
  offset?: number
  limit?: number
}

export interface GetAllActivityResult {
  transactions: IActivityRowGroup[]
  isEnd: boolean
}

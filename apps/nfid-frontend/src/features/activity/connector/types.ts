import { DelegationIdentity } from "@dfinity/identity"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain, StandardizedToken } from "frontend/ui/connnector/types"

import {
  IActivityAction,
  IActivityAssetFT,
  IActivityRow,
  IActivityRowGroup,
} from "../types"

export interface IActivity {
  id: string
  date: string
  from: string
  to: string
  transactionHash: string
  action: IActivityAction
  asset: IActivityAssetFT
}
export interface IActivityDetails {}
export interface IActivityConfig {
  network: Blockchain
  chain: Chain
  tokenStandard: TokenStandards
}

export interface IActivityConnector extends StandardizedToken<TokenStandards> {
  config: IActivityConfig
  getActivities(): Promise<IActivity[]>
  mapActivitiesToRows(
    activities: IActivity[],
    config: IActivityConfig,
  ): IActivityRow[]
  getGroupedActivitiesRows(): Promise<IActivityRowGroup[]>
  getActivityDetails(row: IActivityRow): Promise<IActivityDetails>
  getIdentity(): DelegationIdentity
}

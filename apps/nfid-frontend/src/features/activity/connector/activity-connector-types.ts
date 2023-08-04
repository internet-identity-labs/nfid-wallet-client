import { DelegationIdentity } from "@dfinity/identity"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import {
  IActivityAction,
  IActivityAssetFT,
  IActivityRow,
  IActivityRowGroup,
} from "../types"

export interface IActivity {
  id: string
  date: number
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

export interface IActivityConnector {
  config: IActivityConfig
  getBlockchain(): Blockchain
  getActivities(): Promise<IActivity[]>
  mapActivitiesToRows(
    activities: IActivity[],
    config: IActivityConfig,
  ): IActivityRow[]
  getGroupedActivitiesRows(): Promise<IActivityRowGroup[]>
  getIdentity(): DelegationIdentity
}

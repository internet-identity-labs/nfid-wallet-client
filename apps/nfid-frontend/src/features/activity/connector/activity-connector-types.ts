import { DelegationIdentity } from "@dfinity/identity"
import { Activity } from "packages/integration/src/lib/asset/types"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import { IActivityRow } from "../types"

export interface IActivityDetails {}
export interface IActivityConfig {
  network: Blockchain
  chain: Chain
  tokenStandard: TokenStandards
}

export interface IActivityConnector {
  config: IActivityConfig
  getBlockchain(): Blockchain
  getActivities(): Promise<Activity[]>
  mapActivitiesToRows(
    activities: Activity[],
    config: IActivityConfig,
  ): IActivityRow[]
  getActivitiesRows(): Promise<IActivityRow[]>
  getIdentity(): DelegationIdentity
}

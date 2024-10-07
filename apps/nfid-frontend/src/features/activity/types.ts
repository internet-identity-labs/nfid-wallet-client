import {
  ActivityAssetFT,
  ActivityAssetNFT,
} from "packages/integration/src/lib/asset/types"

import { Chain } from "@nfid/integration"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"
import { Blockchain } from "@nfid/integration/token/types"

export enum IActivityStatus {
  PENDING = "Pending",
  SUCCESS = "Success",
  FAILED = "Failed",
  CANCELLED = "Cancelled",
}

export interface IActivityRow {
  id: string
  action: IActivityAction
  chain: Chain
  network: Blockchain
  timestamp: Date
  asset: ActivityAssetFT | ActivityAssetNFT
  from: string
  to: string
}

export interface IActivityRowGroup {
  date: string
  rows: IActivityRow[]
}

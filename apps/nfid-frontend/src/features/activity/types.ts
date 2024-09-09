import {
  ActivityAssetFT,
  ActivityAssetNFT,
} from "packages/integration/src/lib/asset/types"

import { Blockchain } from "frontend/ui/connnector/types"
import {Chain} from "@nfid/integration";

export enum IActivityAction {
  SENT = "Sent",
  RECEIVED = "Received",
}

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

import {
  ActivityAssetFT,
  ActivityAssetNFT,
} from "packages/integration/src/lib/asset/types"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

export enum IActivityAction {
  SEND = "Send",
  RECEIVE = "Receive",
}

export enum IActivityStatus {
  PENDING = "Pending",
  SUCCESS = "Success",
  FAILED = "Failed",
  CANCELLED = "Cancelled",
}

export interface IActivityRow {
  action: IActivityAction
  chain: Chain
  timestamp: Date
  asset: ActivityAssetFT | ActivityAssetNFT
  from: string
  to: string
}

export interface IActivityRowGroup {
  date: string
  rows: IActivityRow[]
}

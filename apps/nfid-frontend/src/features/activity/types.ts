import {
  ActivityAssetFT,
  ActivityAssetNFT,
} from "packages/integration/src/lib/asset/types"

import { IActivityAction } from "@nfid/integration/token/icrc1/types"

export interface IActivityRow {
  id: string
  action: IActivityAction
  timestamp: Date
  asset: ActivityAssetFT | ActivityAssetNFT
  from: string
  to: string
}

export interface IActivityRowGroup {
  date: string
  rows: IActivityRow[]
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

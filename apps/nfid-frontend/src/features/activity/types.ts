import {
  ActivityAssetFT,
  ActivityAssetNFT,
} from "@nfid/integration/asset/types"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { SwapTransaction } from "src/integration/swap/swap-transaction"

export interface IActivityRow {
  id: string
  action: IActivityAction
  timestamp: Date
  asset: ActivityAssetFT | ActivityAssetNFT
  from: string
  to: string
  transaction?: SwapTransaction
  scanLink?: string
}

export interface IActivityRowGroup {
  date: string
  rows: IActivityRow[]
}

export interface GetAllActivityResult {
  transactions: IActivityRowGroup[]
  isEnd: boolean
}

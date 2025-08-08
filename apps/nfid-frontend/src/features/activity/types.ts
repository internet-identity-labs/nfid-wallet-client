import {
  ActivityAssetFT,
  ActivityAssetNFT,
} from "packages/integration/src/lib/asset/types"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

import { IActivityAction } from "@nfid/integration/token/icrc1/types"

export interface IActivityRow {
  id: string
  action: IActivityAction
  timestamp: Date
  asset: ActivityAssetFT | ActivityAssetNFT
  from: string
  to: string
  transaction?: SwapTransaction
}

export interface IActivityRowGroup {
  date: string
  rows: IActivityRow[]
}

export interface GetAllActivityParams {
  filteredContracts: string[]
  offset?: number
  limit?: number
  btcAddress: string
  ethAddress: string
}

export interface GetAllActivityResult {
  transactions: IActivityRowGroup[]
  isEnd: boolean
}

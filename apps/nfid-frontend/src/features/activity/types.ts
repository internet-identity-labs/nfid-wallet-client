import {
  ActivityAssetFT,
  ActivityAssetNFT,
} from "packages/integration/src/lib/asset/types"

import { Chain } from "@nfid/integration"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"
import { Blockchain } from "@nfid/integration/token/types"

import { SwapTransaction } from "frontend/integration/icpswap/swap-transaction"

export interface IActivityRow {
  id: string
  action: IActivityAction
  timestamp: Date
  asset: ActivityAssetFT | ActivityAssetNFT
  from: string
  to: string
  transaction?: SwapTransaction
  chain: Chain
  network: Blockchain
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

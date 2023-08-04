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

export interface IActivityAssetNFT {
  type: "nft"
  name: string
  collectionName: string
  preview: string
}
export interface IActivityAssetFT {
  type: "ft"
  currency: string
  amount: number
  amountUSD: number
}

export interface IActivityRow {
  action: IActivityAction
  chain: Chain
  timestamp: number
  asset: IActivityAssetFT | IActivityAssetNFT
  from: string
  to: string
}

export interface IActivityRowGroup {
  date: string
  rows: IActivityRow[]
}

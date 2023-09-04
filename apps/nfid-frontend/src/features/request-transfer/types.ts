import { DelegationIdentity } from "@dfinity/identity"

import { Blockchain, NativeToken } from "frontend/ui/connnector/types"

export interface IRequestTransfer {
  amount: number
  to: string
  identity: DelegationIdentity
}

export enum TransferStatus {
  "SUCCESS",
  "ERROR",
  "REJECTED",
}

export interface IRequestTransferResponse {
  status: TransferStatus
  message?: string
  blockIndex?: number
}

export interface IRequestTransferConnector {
  getRate(currency: string): Promise<number>
  transfer(request: IRequestTransfer): Promise<IRequestTransferResponse>
  getBalance(): Promise<number>
  getIdentity(): Promise<DelegationIdentity>
}

export type RequestTransferConfig = {
  blockchain: Blockchain
  feeCurrency: NativeToken
}

import { TransferStatus } from "../request-transfer/types"

export interface ICanisterCallRequest {
  canisterId: string
  method: string
  sourceAddress: string
  parameters?: string
}

export interface ICanisterCallResponse {
  status: TransferStatus
  errorMessage?: string
  response?: string
}

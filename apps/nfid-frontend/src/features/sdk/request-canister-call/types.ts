import { RequestStatus } from "frontend/features/types"

export interface ICanisterCallRequest {
  canisterId: string
  method: string
  sourceAddress: string
  parameters?: string
}

export interface ICanisterCallResponse {
  status: RequestStatus
  errorMessage?: string
  response?: string
}

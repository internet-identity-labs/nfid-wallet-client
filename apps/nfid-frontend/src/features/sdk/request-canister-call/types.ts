import { TransferStatus } from "../request-transfer/types"

export interface ICanisterCallResponse {
  status: TransferStatus
  response?: string
}

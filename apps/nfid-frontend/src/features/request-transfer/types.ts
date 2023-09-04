export enum TransferStatus {
  "SUCCESS" = "SUCCESS",
  "ERROR" = "ERROR",
  "REJECTED" = "REJECTED",
}

export interface IRequestTransferResponse {
  status: TransferStatus
  message?: string
  hash?: string
}

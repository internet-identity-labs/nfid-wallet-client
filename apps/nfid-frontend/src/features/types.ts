export enum TransferStatus {
  "SUCCESS" = "SUCCESS",
  "ERROR" = "ERROR",
  "REJECTED" = "REJECTED",
}

export interface SdkResponse {
  status: TransferStatus
  errorMessage?: string
}

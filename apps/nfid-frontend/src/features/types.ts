export enum RequestStatus {
  "SUCCESS" = "SUCCESS",
  "ERROR" = "ERROR",
  "REJECTED" = "REJECTED",
}

export interface SdkResponse {
  status: RequestStatus
  errorMessage?: string
}

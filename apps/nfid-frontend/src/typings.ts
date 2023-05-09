export enum ServiceWorkerEvents {
  SaveICHostInfo = "SaveICHostInfo",
}

export interface ICHostInfoEvent {
  canisterId: string
}

export interface SaveICHostInfoMessage {
  action: ServiceWorkerEvents.SaveICHostInfo
  data: ICHostInfoEvent
}

export interface QueryResponseBase {
  status: QueryResponseStatus
}

export enum ReplicaRejectCode {
  SysFatal = 1,
  SysTransient = 2,
  DestinationInvalid = 3,
  CanisterReject = 4,
  CanisterError = 5,
}

export interface QueryResponseRejected extends QueryResponseBase {
  status: QueryResponseStatus.Rejected
  reject_code: ReplicaRejectCode
  reject_message: string
}

export interface QueryResponseReplied extends QueryResponseBase {
  status: QueryResponseStatus.Replied
  reply: {
    arg: ArrayBuffer
  }
}

export type QueryResponse = QueryResponseReplied | QueryResponseRejected
export enum QueryResponseStatus {
  Replied = "replied",
  Rejected = "rejected",
}

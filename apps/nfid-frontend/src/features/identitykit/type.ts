export type IdentityKitRPCMachineContext = {
  requestsQueue: MessageEvent<RPCMessage>[]
  activeRequest: MessageEvent<RPCMessage> | undefined
  activeRequestMetadata: any | undefined
  componentData: any
}

export type IdentityKitRPCEvents =
  | { type: "ON_INITIALIZED" }
  | { type: "ON_REQUEST" }
  | { type: "ON_CANCEL" }
  | { type: "ON_APPROVE" }

export type IdentityKitRPCMachineServices = {
  validateRequest: {
    data: null
  }
  executeRequest: {
    data: null
  }
  sendResponse: {
    data: null
  }
  assignRequest: {
    data: any
  }
}

export interface Account {
  id: number
  displayName: string
  principal: string
  subaccount: string
  balance?: number
  type: AccountType
}

export enum AccountType {
  GLOBAL = "GLOBAL",
  SESSION = "SESSION",
  ANONYMOUS_LEGACY = "ANONYMOUS_LEGACY",
}

export interface RPCBase {
  origin: string
  jsonrpc: string
  id: string
}

export interface RPCMessage extends RPCBase {
  method: string
  params: unknown[]
}

export interface RPCSuccessResponse extends RPCBase {
  result: unknown
}

export interface RPCErrorResponse extends RPCBase {
  error: {
    code: number
    message: string
    data?: unknown
  }
}

export interface Icrc25Dto {
  scopes: Scope[]
}

export interface Scope {
  method: string
}

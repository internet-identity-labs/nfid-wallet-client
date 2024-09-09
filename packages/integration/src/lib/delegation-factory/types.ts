import {Principal} from "@dfinity/principal";


export type PrepareDelegationArgs = {
  userNumber: bigint
  frontendHostname: string
  sessionKey: Uint8Array
  maxTimeToLive: [] | [bigint]
  targets: [] | [Array<Principal>]
}



export type GetDelegationArgs = {
  userNumber: bigint
  frontendHostname: string
  sessionKey: Uint8Array
  expiration: bigint
  targets: [] | [Array<Principal>]
}

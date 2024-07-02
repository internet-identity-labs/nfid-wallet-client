import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import type { Principal } from "@dfinity/principal"

export interface Delegation {
  pubkey: PublicKey
  targets: [] | [Array<Principal>]
  expiration: Timestamp
}
export type FrontendHostname = string
export type GetDelegationResponse =
  | { no_such_delegation: null }
  | { signed_delegation: SignedDelegation }
export interface InitArgs {
  im_canister: Principal
}
export type PublicKey = Uint8Array | number[]
export type SessionKey = PublicKey
export interface SignedDelegation {
  signature: Uint8Array | number[]
  delegation: Delegation
}
export type Timestamp = bigint
export type UserKey = PublicKey
export type UserNumber = bigint
export interface _SERVICE {
  get_delegation: ActorMethod<
    [
      UserNumber,
      FrontendHostname,
      SessionKey,
      Timestamp,
      [] | [Array<Principal>],
    ],
    GetDelegationResponse
  >
  get_principal: ActorMethod<[UserNumber, FrontendHostname], Principal>
  init_salt: ActorMethod<[], undefined>
  prepare_delegation: ActorMethod<
    [
      UserNumber,
      FrontendHostname,
      SessionKey,
      [] | [bigint],
      [] | [Array<Principal>],
    ],
    [UserKey, Timestamp]
  >
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[]

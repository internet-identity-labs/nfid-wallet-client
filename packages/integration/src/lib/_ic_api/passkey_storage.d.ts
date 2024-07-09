import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import type { Principal } from "@dfinity/principal"

export interface InitArgs {
  im_canister: Principal
}
export interface _SERVICE {
  get_passkey: ActorMethod<[], [string]>
  store_passkey: ActorMethod<[string], bigint>
}
export declare const idlFactory: IDL.InterfaceFactory

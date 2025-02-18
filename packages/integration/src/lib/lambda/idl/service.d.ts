import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import type { Principal } from "@dfinity/principal"

export interface InitArgs {
  ecdsa_salt: string
  salt: string
  im_canister: Principal
}
export interface _SERVICE {
  get_anon_salt: ActorMethod<[string], string>
  get_salt: ActorMethod<[], string>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]

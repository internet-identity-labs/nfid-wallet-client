import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"

export interface Conf {
  im_canister: [] | [string]
}
export interface ICRC1 {
  state: ICRC1State
  ledger: string
  network: number
}
export type ICRC1State = { Inactive: null } | { Active: null }
export interface _SERVICE {
  get_canisters_by_root: ActorMethod<[string], Array<ICRC1>>
  remove_icrc1_canister: ActorMethod<[string], undefined>
  store_icrc1_canister: ActorMethod<
    [string, ICRC1State, [] | [number]],
    undefined
  >
}
export declare const idlFactory: IDL.InterfaceFactory

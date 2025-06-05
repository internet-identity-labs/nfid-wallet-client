import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import type { Principal } from "@dfinity/principal"

export type Category =
  | { Sns: null }
  | { Spam: null }
  | { Native: null }
  | { Known: null }
  | { ChainFusionTestnet: null }
  | { ChainFusion: null }
  | { Community: null }
export interface Conf {
  controllers: [] | [Array<Principal>]
  im_canister: [] | [Principal]
}
export interface ICRC1 {
  fee: bigint
  decimals: number
  logo: [] | [string]
  name: string
  ledger: string
  category: Category
  index: [] | [string]
  symbol: string
  root_canister_id: [] | [string]
}
export interface ICRC1Request {
  fee: bigint
  decimals: number
  logo: [] | [string]
  name: string
  ledger: string
  index: [] | [string]
  symbol: string
}
export interface _SERVICE {
  allow_signing : ActorMethod<[], undefined>,
  count_icrc1_canisters: ActorMethod<[], bigint>
  get_all_icrc1_canisters: ActorMethod<[], Array<ICRC1>>
  get_icrc1_paginated: ActorMethod<[number, number], Array<ICRC1>>
  replace_icrc1_canisters: ActorMethod<[Array<ICRC1>], undefined>
  store_icrc1_canister: ActorMethod<[ICRC1Request], undefined>
  store_new_icrc1_canisters: ActorMethod<[Array<ICRC1>], undefined>
  sync_controllers: ActorMethod<[], Array<string>>
}
export declare const idlFactory: IDL.InterfaceFactory

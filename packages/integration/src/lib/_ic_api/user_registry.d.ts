import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"

export interface AddressBookAddress {
  value: string
  address_type: AddressBookAddressType
}
export type AddressBookAddressType =
  | { BTC: null }
  | { ETH: null }
  | { IcpAddress: null }
  | { IcpPrincipal: null }
export interface AddressBookConf {
  max_user_addresses: number
  max_name_length: number
}
export type AddressBookError =
  | { NameTooLong: null }
  | { DuplicateName: null }
  | { MaxAddressesReached: null }
  | { DuplicateAddress: null }
  | { AddressNotFound: null }
  | { Unauthorized: null }
export interface AddressBookUserAddress {
  id: string
  name: string
  addresses: Array<AddressBookAddress>
}
export interface Conf {
  im_canister: [] | [string]
}
export interface ICRC1 {
  state: ICRC1State
  ledger: string
  network: number
}
export type ICRC1State = { Inactive: null } | { Active: null }
export type Result = { Ok: null } | { Err: AddressBookError }
export type Result_1 =
  | { Ok: Array<AddressBookUserAddress> }
  | { Err: AddressBookError }
export interface _SERVICE {
  address_book_delete: ActorMethod<[string], Result_1>
  address_book_delete_all: ActorMethod<[], Result>
  address_book_find_all: ActorMethod<[], Result_1>
  address_book_get_config: ActorMethod<[], AddressBookConf>
  address_book_save: ActorMethod<[AddressBookUserAddress], Result_1>
  address_book_set_config: ActorMethod<[AddressBookConf], Result>
  get_canisters_by_root: ActorMethod<[string], Array<ICRC1>>
  remove_icrc1_canister: ActorMethod<[string], undefined>
  store_icrc1_canister: ActorMethod<
    [string, ICRC1State, [] | [number]],
    undefined
  >
}
export declare const idlFactory: IDL.InterfaceFactory

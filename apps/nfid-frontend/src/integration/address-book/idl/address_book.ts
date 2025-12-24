import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"

export interface Conf {
  max_user_addresses: number
  max_name_length: number
}
export type AddressType =
  | { IcpAddress: null }
  | { IcpPrincipal: null }
  | { BTC: null }
  | { ETH: null }
export interface Address {
  address_type: AddressType
  value: string
}
export interface UserAddress {
  id: string
  name: string
  addresses: Array<Address>
}
export type AddressBookError =
  | { NameTooLong: null }
  | { MaxAddressesReached: null }
  | { AddressNotFound: null }
  | { DuplicateAddress: null }
  | { DuplicateName: null }
  | { Unauthorized: null }
export type Result = { Ok: null } | { Err: AddressBookError }
export type ResultWithAddresses =
  | { Ok: Array<UserAddress> }
  | { Err: AddressBookError }
export type SetConfigResult = { Ok: null } | { Err: AddressBookError }
export interface _SERVICE {
  save: ActorMethod<[UserAddress], ResultWithAddresses>
  delete: ActorMethod<[string], ResultWithAddresses>
  delete_all: ActorMethod<[], Result>
  find_all: ActorMethod<[], ResultWithAddresses>
  get_config: ActorMethod<[], Conf>
  set_config: ActorMethod<[Conf], SetConfigResult>
}
export declare const idlFactory: IDL.InterfaceFactory

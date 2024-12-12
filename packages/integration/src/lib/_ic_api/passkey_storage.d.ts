import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface InitArgs { 'im_canister' : Principal }
export interface PassKeyData { 'key' : string, 'data' : string }
export interface _SERVICE {
  'get_passkey' : ActorMethod<[Array<string>], Array<PassKeyData>>,
  'get_passkey_by_anchor' : ActorMethod<[bigint], Array<PassKeyData>>,
  'remove_passkey' : ActorMethod<[string, bigint], bigint>,
  'store_passkey' : ActorMethod<[string, string, bigint], bigint>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

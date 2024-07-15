import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface InitArgs { 'im_canister' : Principal }
export interface PassKeyData { 'data' : string, 'key' : string }
export interface _SERVICE {
  'get_passkey' : ActorMethod<[Array<string>], Array<PassKeyData>>,
  'store_passkey' : ActorMethod<[string, string], bigint>,
}
export declare const idlFactory: IDL.InterfaceFactory;

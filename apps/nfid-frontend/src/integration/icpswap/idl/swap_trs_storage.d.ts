import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface InitArgs { 'im_canister' : Principal }
export type SwapStage = { 'Withdraw' : null } |
  { 'Deposit' : null } |
  { 'Swap' : null } |
  { 'Completed' : null } |
  { 'TransferNFID' : null } |
  { 'TransferSwap' : null };
export interface SwapTransaction {
  'uid' : string,
  'withdraw' : [] | [bigint],
  'swap' : [] | [bigint],
  'deposit' : [] | [bigint],
  'end_time' : [] | [bigint],
  'transfer_id' : [] | [bigint],
  'target_ledger' : string,
  'error' : [] | [string],
  'stage' : SwapStage,
  'start_time' : bigint,
  'source_ledger' : string,
  'transfer_nfid_id' : [] | [bigint],
  'target_amount' : bigint,
  'source_amount' : bigint,
}
export interface _SERVICE {
  'get_transactions' : ActorMethod<[string], Array<SwapTransaction>>,
  'store_transaction' : ActorMethod<[SwapTransaction], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[];

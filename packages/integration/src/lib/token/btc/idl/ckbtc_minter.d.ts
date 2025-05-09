import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import type { Principal } from "@dfinity/principal"

export enum Status {
  'pending' = 'pending',
  'confirmed' = 'confirmed',
  'failed' = 'failed'
}

export interface _SERVICE {
  get_btc_address: ActorMethod<[], {
    address: string;
    derivation_path: string;
  }>;
  get_deposit_status: ActorMethod<[string], {
    address: string;
    amount: bigint;
    status: Status;
    tx_id: string;
    created_at: bigint;
    confirmed_at?: bigint;
  }>;
}

export declare const idlFactory: IDL.InterfaceFactory 
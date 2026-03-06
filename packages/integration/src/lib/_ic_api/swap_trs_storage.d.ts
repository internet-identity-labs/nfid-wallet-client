import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import type { Principal } from "@dfinity/principal"

export interface Error {
  time: bigint
  message: string
}
export type SwapStage =
  | { Withdraw: null }
  | { Deposit: null }
  | { Swap: null }
  | { Completed: null }
  | { TransferNFID: null }
  | { TransferSwap: null }
export interface SwapTransaction {
  uid: string
  withdraw: [] | [bigint]
  swap: [] | [bigint]
  errors: Array<Error>
  deposit: [] | [bigint]
  end_time: [] | [bigint]
  transfer_id: [] | [bigint]
  target_ledger: string
  stage: SwapStage
  start_time: bigint
  source_ledger: string
  transfer_nfid_id: [] | [bigint]
  target_amount: bigint
  source_amount: bigint
  swap_provider: { Kong: null } | { IcpSwap: null }
}
export interface NoteEntry {
  key: Uint8Array | number[]
  value: string
}
export interface _SERVICE {
  get_transactions: ActorMethod<[string], Array<SwapTransaction>>
  store_transaction: ActorMethod<[SwapTransaction], undefined>
  get_notes: ActorMethod<[Array<Uint8Array | number[]>], Array<NoteEntry>>
  store_note: ActorMethod<[Uint8Array | number[], string], undefined>
}
export declare const idlFactory: IDL.InterfaceFactory

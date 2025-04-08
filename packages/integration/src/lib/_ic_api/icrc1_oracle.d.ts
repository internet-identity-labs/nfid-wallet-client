import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import type { Principal } from "@dfinity/principal"

export type BitcoinNetwork =
  | { mainnet: null }
  | { regtest: null }
  | { testnet: null }
export type BtcSelectUserUtxosFeeResult =
  | { Ok: SelectedUtxosFeeResponse }
  | { Err: SelectedUtxosFeeError }
export type Category =
  | { Sns: null }
  | { Spam: null }
  | { Native: null }
  | { Known: null }
  | { ChainFusionTestnet: null }
  | { ChainFusion: null }
  | { Community: null }
export interface Conf {
  operator: [] | [Principal]
  im_canister: [] | [Principal]
}
export interface ICRC1 {
  fee: bigint
  root_canister_id: [] | [string]
  decimals: number
  logo: [] | [string]
  name: string
  date_added: bigint
  ledger: string
  category: Category
  index: [] | [string]
  symbol: string
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

export interface NeuronData {
  name: string
  date_added: bigint
  ledger: string
  neuron_id: string
}
export interface Outpoint {
  txid: Uint8Array | number[]
  vout: number
}
export type SelectedUtxosFeeError = { InternalError: { msg: string } }
export interface SelectedUtxosFeeRequest {
  network: BitcoinNetwork
  amount_satoshis: bigint
  min_confirmations: [] | [number]
}
export interface SelectedUtxosFeeResponse {
  fee_satoshis: bigint
  utxos: Array<Utxo>
}
export interface Utxo {
  height: number
  value: bigint
  outpoint: Outpoint
}
export interface _SERVICE {
  allow_signing: ActorMethod<[], undefined>
  btc_select_user_utxos_fee: ActorMethod<
    [SelectedUtxosFeeRequest],
    BtcSelectUserUtxosFeeResult
  >
  count_icrc1_canisters: ActorMethod<[], bigint>
  get_all_icrc1_canisters: ActorMethod<[], Array<ICRC1>>
  get_all_neurons: ActorMethod<[], Array<NeuronData>>
  get_icrc1_paginated: ActorMethod<[bigint, bigint], Array<ICRC1>>
  remove_icrc1_canister: ActorMethod<[string], undefined>
  replace_all_neurons: ActorMethod<[Array<NeuronData>], undefined>
  replace_icrc1_canisters: ActorMethod<[Array<ICRC1>], undefined>
  set_operator: ActorMethod<[Principal], undefined>
  store_icrc1_canister: ActorMethod<[ICRC1Request], undefined>
  store_new_icrc1_canisters: ActorMethod<[Array<ICRC1>], undefined>
  sync_controllers: ActorMethod<[], Array<string>>
  get_all_neurons: ActorMethod<[], Array<NeuronData>>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]

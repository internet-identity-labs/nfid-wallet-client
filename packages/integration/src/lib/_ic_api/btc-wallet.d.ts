import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export type bitcoin_address = string
export type block_hash = Uint8Array
export interface get_utxos_response {
  next_page: [] | [Uint8Array]
  tip_height: number
  tip_block_hash: block_hash
  utxos: Array<utxo>
}
export type millisatoshi_per_byte = bigint
export type network = { Mainnet: null } | { Regtest: null } | { Testnet: null }
export interface outpoint {
  txid: Uint8Array
  vout: number
}
export type satoshi = bigint
export interface utxo {
  height: number
  value: satoshi
  outpoint: outpoint
}
export interface _SERVICE {
  get_balance: ActorMethod<[bitcoin_address], satoshi>
  get_current_fee_percentiles: ActorMethod<[], BigUint64Array>
  get_p2pkh_address: ActorMethod<[], bitcoin_address>
  get_utxos: ActorMethod<[bitcoin_address], get_utxos_response>
  send: ActorMethod<
    [
      {
        destination_address: bitcoin_address
        amount_in_satoshi: satoshi
      },
    ],
    string
  >
}

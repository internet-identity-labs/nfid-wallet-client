import type { Principal } from "@icp-sdk/core/principal"
import type { ActorMethod } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"

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
export type LoginType = { Global: null } | { Anonymous: null }
export type DiscoveryStatus =
  | { New: null }
  | { Updated: null }
  | { Verified: null }
  | { Spam: null }
export interface DiscoveryVisitRequest {
  derivation_origin: [] | [string]
  hostname: string
  login: LoginType
  anonymous_principal: [] | [Principal]
}
export interface UserDiscoveryApp {
  app_id: number
  anonymous_principal: string
}
export interface DiscoveryApp {
  id: number
  derivation_origin: [] | [string]
  hostname: string
  url: [] | [string]
  name: [] | [string]
  image: [] | [string]
  desc: [] | [string]
  is_global: boolean
  is_anonymous: boolean
  unique_users: bigint
  status: DiscoveryStatus
}
export interface PromotionConfig {
  min_bid_e8s: bigint
  bid_increment_e8s: bigint
  locked_period_ns: bigint
  feature_duration_ns: bigint
  ledger_canister: Principal
  treasury: Principal
}
export interface FeaturedSlot {
  app_id: number
  bidder: Principal
  bid_amount_e8s: bigint
  bid_time_ns: bigint
  locked_until_ns: bigint
  expires_at_ns: bigint
}
export interface HistoricalBid {
  app_id: number
  bidder: Principal
  bid_amount_e8s: bigint
  bid_time_ns: bigint
}
export interface PromotionStatus {
  config: PromotionConfig
  featured: [] | [FeaturedSlot]
  min_next_bid_e8s: bigint
  locked: boolean
  now_ns: bigint
}
export interface PlaceBidArg {
  app_id: number
  amount_e8s: bigint
}
export type PlaceBidError =
  | { Locked: { until_ns: bigint } }
  | { BelowFloor: { floor_e8s: bigint } }
  | { BelowIncrement: { required_e8s: bigint } }
  | { UnknownApp: null }
  | { TransferFailed: string }
  | { NotConfigured: null }
export type PlaceBidResult = { Ok: FeaturedSlot } | { Err: PlaceBidError }
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
  count_discovery_apps: ActorMethod<[], bigint>
  store_discovery_app: ActorMethod<[DiscoveryVisitRequest], undefined>
  is_unique: ActorMethod<[DiscoveryVisitRequest], boolean>
  get_my_discovery_apps: ActorMethod<[], Array<UserDiscoveryApp>>
  get_discovery_app_paginated: ActorMethod<
    [bigint, bigint],
    Array<DiscoveryApp>
  >
  replace_all_discovery_app: ActorMethod<[Array<DiscoveryApp>], undefined>
  clear_discovery_apps: ActorMethod<[], undefined>
  set_promotion_config: ActorMethod<[PromotionConfig], undefined>
  get_promotion_status: ActorMethod<[], PromotionStatus>
  place_bid: ActorMethod<[PlaceBidArg], PlaceBidResult>
  veto_current_featured: ActorMethod<[], undefined>
  count_bid_history: ActorMethod<[], bigint>
  get_bid_history_paginated: ActorMethod<[bigint, bigint], Array<HistoricalBid>>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]

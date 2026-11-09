import type { Principal } from "@icp-sdk/core/principal"
import type { ActorMethod } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"

export interface Account {
  owner: Principal
  subaccount: [] | [Uint8Array | number[]]
}
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
export interface CreateListingArg {
  token_id: bigint
  collection: Principal
  price_e8s: bigint
}
export interface DiscoveryApp {
  id: number
  url: [] | [string]
  derivation_origin: [] | [string]
  status: DiscoveryStatus
  desc: [] | [string]
  name: [] | [string]
  is_global: boolean
  hostname: string
  unique_users: bigint
  is_anonymous: boolean
  image: [] | [string]
}
export type DiscoveryStatus =
  | { New: null }
  | { Spam: null }
  | { Updated: null }
  | { Verified: null }
export interface DiscoveryVisitRequest {
  derivation_origin: [] | [string]
  anonymous_principal: [] | [Principal]
  hostname: string
  login: LoginType
}
export interface FeaturedSlot {
  locked_until_ns: bigint
  bid_amount_e8s: bigint
  app_id: number
  bid_time_ns: bigint
  bidder: Principal
  expires_at_ns: bigint
}
export interface HistoricalBid {
  bid_amount_e8s: bigint
  app_id: number
  bid_time_ns: bigint
  bidder: Principal
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
export interface Listing {
  id: bigint
  status: ListingStatus
  updated_at: bigint
  token_id: bigint
  collection: Principal
  created_at: bigint
  seller: Principal
  price_e8s: bigint
}
export interface ListingPage {
  total: bigint
  items: Array<Listing>
}
export interface ListingQuery {
  collection: [] | [Principal]
  sort: [] | [ListingSort]
  offset: bigint
  limit: bigint
}
export type ListingResult = { Ok: Listing } | { Err: MarketplaceError }
export type ListingSort =
  | { Oldest: null }
  | { PriceDesc: null }
  | { PriceAsc: null }
  | { Newest: null }
export type ListingStatus =
  | { Sold: null }
  | { Active: null }
  | { Locked: null }
  | { Cancelled: null }
export type LoginType = { Anonymous: null } | { Global: null }
export interface MarketTx {
  id: bigint
  nft_ts: [] | [bigint]
  last_error: [] | [string]
  status: TxStatus
  updated_at: bigint
  token_id: bigint
  collection: Principal
  settle_block: [] | [bigint]
  attempts: number
  fee_e8s: bigint
  created_at: bigint
  seller: Principal
  needs_review: boolean
  payment_block: [] | [bigint]
  buyer: Principal
  listing_id: bigint
  price_e8s: bigint
  payment_ts: [] | [bigint]
  nft_block: [] | [bigint]
  settle_ts: [] | [bigint]
}
export type MarketTxResult = { Ok: MarketTx } | { Err: MarketplaceError }
export interface MarketplaceConfig {
  min_price_e8s: bigint
  icp_ledger: Principal
  max_retries: number
}
export type MarketplaceError =
  | { CallFailed: string }
  | { CollectionNotAllowed: null }
  | { ListingNotActive: null }
  | { PaymentFailed: string }
  | { InvalidTxState: null }
  | { CollectionNotFound: null }
  | { TxNotFound: null }
  | { Unauthorized: null }
  | { NotOwner: null }
  | { NotApproved: null }
  | { PurchaseInProgress: null }
  | { NotConfigured: null }
  | { CannotBuyOwnListing: null }
  | { PriceTooLow: { min_price_e8s: bigint } }
  | { AlreadyListed: { listing_id: bigint } }
  | { NftUnavailable: null }
  | { AnonymousCaller: null }
  | { ListingNotFound: null }
export interface NeuronData {
  name: string
  date_added: bigint
  ledger: string
  neuron_id: string
}
export interface NftCollection {
  status: NftCollectionStatus
  logo: [] | [string]
  name: string
  canister_id: Principal
  description: [] | [string]
  date_added: bigint
  symbol: string
}
export interface NftCollectionRequest {
  logo: [] | [string]
  name: string
  canister_id: Principal
  description: [] | [string]
  symbol: string
}
export type NftCollectionStatus =
  | { Spam: null }
  | { Hidden: null }
  | { Verified: null }
  | { Community: null }
export interface Outpoint {
  txid: Uint8Array | number[]
  vout: number
}
export interface PlaceBidArg {
  amount_e8s: bigint
  app_id: number
}
export type PlaceBidError =
  | { BelowFloor: { floor_e8s: bigint } }
  | { UnknownApp: null }
  | { BelowIncrement: { required_e8s: bigint } }
  | { Locked: { until_ns: bigint } }
  | { NotConfigured: null }
  | { TransferFailed: string }
export type PlaceBidResult = { Ok: FeaturedSlot } | { Err: PlaceBidError }
export interface PromotionConfig {
  locked_period_ns: bigint
  min_bid_e8s: bigint
  bid_increment_e8s: bigint
  feature_duration_ns: bigint
  ledger_canister: Principal
  treasury: Principal
}
export interface PromotionStatus {
  featured: [] | [FeaturedSlot]
  now_ns: bigint
  min_next_bid_e8s: bigint
  locked: boolean
  config: PromotionConfig
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
export type TxStatus =
  | { Failed: null }
  | { Refunded: null }
  | { PayoutPending: null }
  | { RefundPending: null }
  | { NftTransferPending: null }
  | { ClosedByAdmin: null }
  | { PaymentPending: null }
  | { Completed: null }
export interface UserDiscoveryApp {
  anonymous_principal: string
  app_id: number
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
  buy_listing: ActorMethod<[bigint], MarketTxResult>
  cancel_listing: ActorMethod<[bigint], ListingResult>
  clear_discovery_apps: ActorMethod<[], undefined>
  close_marketplace_tx: ActorMethod<[bigint, string], MarketTxResult>
  count_bid_history: ActorMethod<[], bigint>
  count_discovery_apps: ActorMethod<[], bigint>
  count_icrc1_canisters: ActorMethod<[], bigint>
  count_marketplace_txs: ActorMethod<[], bigint>
  count_nft_collections: ActorMethod<[], bigint>
  create_listing: ActorMethod<[CreateListingArg], ListingResult>
  get_all_icrc1_canisters: ActorMethod<[], Array<ICRC1>>
  get_all_neurons: ActorMethod<[], Array<NeuronData>>
  get_bid_history_paginated: ActorMethod<[bigint, bigint], Array<HistoricalBid>>
  get_discovery_app_paginated: ActorMethod<
    [bigint, bigint],
    Array<DiscoveryApp>
  >
  get_icrc1_paginated: ActorMethod<[bigint, bigint], Array<ICRC1>>
  get_listing: ActorMethod<[bigint], [] | [Listing]>
  get_listings: ActorMethod<[ListingQuery], ListingPage>
  get_listings_by_seller: ActorMethod<
    [Principal, bigint, bigint],
    Array<Listing>
  >
  get_marketplace_config: ActorMethod<[], [] | [MarketplaceConfig]>
  get_marketplace_escrow: ActorMethod<[], Account>
  get_marketplace_tx: ActorMethod<[bigint], [] | [MarketTx]>
  get_marketplace_txs_by_user: ActorMethod<
    [Principal, bigint, bigint],
    Array<MarketTx>
  >
  get_marketplace_txs_paginated: ActorMethod<[bigint, bigint], Array<MarketTx>>
  get_my_discovery_apps: ActorMethod<[], Array<UserDiscoveryApp>>
  get_nft_collection: ActorMethod<[Principal], [] | [NftCollection]>
  get_nft_collections_paginated: ActorMethod<
    [bigint, bigint],
    Array<NftCollection>
  >
  get_pending_marketplace_txs: ActorMethod<[], Array<MarketTx>>
  get_promotion_status: ActorMethod<[], PromotionStatus>
  is_unique: ActorMethod<[DiscoveryVisitRequest], boolean>
  place_bid: ActorMethod<[PlaceBidArg], PlaceBidResult>
  remove_icrc1_canister: ActorMethod<[string], undefined>
  remove_nft_collection: ActorMethod<[Principal], undefined>
  replace_all_discovery_app: ActorMethod<[Array<DiscoveryApp>], undefined>
  replace_all_neurons: ActorMethod<[Array<NeuronData>], undefined>
  replace_icrc1_canisters: ActorMethod<[Array<ICRC1>], undefined>
  replace_nft_collections: ActorMethod<[Array<NftCollection>], undefined>
  retry_marketplace_tx: ActorMethod<[bigint, boolean], MarketTxResult>
  run_marketplace_clock: ActorMethod<[], number>
  set_marketplace_config: ActorMethod<[MarketplaceConfig], undefined>
  set_nft_collection_status: ActorMethod<
    [Principal, NftCollectionStatus],
    undefined
  >
  set_operator: ActorMethod<[Principal], undefined>
  set_promotion_config: ActorMethod<[PromotionConfig], undefined>
  store_discovery_app: ActorMethod<[DiscoveryVisitRequest], undefined>
  store_icrc1_canister: ActorMethod<[ICRC1Request], undefined>
  store_new_icrc1_canisters: ActorMethod<[Array<ICRC1>], undefined>
  store_nft_collection: ActorMethod<[NftCollectionRequest], undefined>
  veto_current_featured: ActorMethod<[], undefined>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]

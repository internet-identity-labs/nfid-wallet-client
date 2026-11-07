export const idlFactory = ({ IDL }: any) => {
  const Conf = IDL.Record({
    operator: IDL.Opt(IDL.Principal),
    im_canister: IDL.Opt(IDL.Principal),
  })
  const BitcoinNetwork = IDL.Variant({
    mainnet: IDL.Null,
    regtest: IDL.Null,
    testnet: IDL.Null,
  })
  const SelectedUtxosFeeRequest = IDL.Record({
    network: BitcoinNetwork,
    amount_satoshis: IDL.Nat64,
    min_confirmations: IDL.Opt(IDL.Nat32),
  })
  const Outpoint = IDL.Record({
    txid: IDL.Vec(IDL.Nat8),
    vout: IDL.Nat32,
  })
  const Utxo = IDL.Record({
    height: IDL.Nat32,
    value: IDL.Nat64,
    outpoint: Outpoint,
  })
  const SelectedUtxosFeeResponse = IDL.Record({
    fee_satoshis: IDL.Nat64,
    utxos: IDL.Vec(Utxo),
  })
  const SelectedUtxosFeeError = IDL.Variant({
    InternalError: IDL.Record({ msg: IDL.Text }),
  })
  const BtcSelectUserUtxosFeeResult = IDL.Variant({
    Ok: SelectedUtxosFeeResponse,
    Err: SelectedUtxosFeeError,
  })
  const TxStatus = IDL.Variant({
    Failed: IDL.Null,
    Refunded: IDL.Null,
    PayoutPending: IDL.Null,
    RefundPending: IDL.Null,
    NftTransferPending: IDL.Null,
    ClosedByAdmin: IDL.Null,
    PaymentPending: IDL.Null,
    Completed: IDL.Null,
  })
  const MarketTx = IDL.Record({
    id: IDL.Nat64,
    nft_ts: IDL.Opt(IDL.Nat64),
    last_error: IDL.Opt(IDL.Text),
    status: TxStatus,
    updated_at: IDL.Nat64,
    token_id: IDL.Nat,
    collection: IDL.Principal,
    settle_block: IDL.Opt(IDL.Nat),
    attempts: IDL.Nat32,
    fee_e8s: IDL.Nat,
    created_at: IDL.Nat64,
    seller: IDL.Principal,
    needs_review: IDL.Bool,
    payment_block: IDL.Opt(IDL.Nat),
    buyer: IDL.Principal,
    listing_id: IDL.Nat64,
    price_e8s: IDL.Nat,
    payment_ts: IDL.Opt(IDL.Nat64),
    nft_block: IDL.Opt(IDL.Nat),
    settle_ts: IDL.Opt(IDL.Nat64),
  })
  const MarketplaceError = IDL.Variant({
    CallFailed: IDL.Text,
    CollectionNotAllowed: IDL.Null,
    ListingNotActive: IDL.Null,
    PaymentFailed: IDL.Text,
    InvalidTxState: IDL.Null,
    CollectionNotFound: IDL.Null,
    TxNotFound: IDL.Null,
    Unauthorized: IDL.Null,
    NotOwner: IDL.Null,
    NotApproved: IDL.Null,
    PurchaseInProgress: IDL.Null,
    NotConfigured: IDL.Null,
    CannotBuyOwnListing: IDL.Null,
    PriceTooLow: IDL.Record({ min_price_e8s: IDL.Nat }),
    AlreadyListed: IDL.Record({ listing_id: IDL.Nat64 }),
    NftUnavailable: IDL.Null,
    AnonymousCaller: IDL.Null,
    ListingNotFound: IDL.Null,
  })
  const MarketTxResult = IDL.Variant({
    Ok: MarketTx,
    Err: MarketplaceError,
  })
  const ListingStatus = IDL.Variant({
    Sold: IDL.Null,
    Active: IDL.Null,
    Locked: IDL.Null,
    Cancelled: IDL.Null,
  })
  const Listing = IDL.Record({
    id: IDL.Nat64,
    status: ListingStatus,
    updated_at: IDL.Nat64,
    token_id: IDL.Nat,
    collection: IDL.Principal,
    created_at: IDL.Nat64,
    seller: IDL.Principal,
    price_e8s: IDL.Nat,
  })
  const ListingResult = IDL.Variant({
    Ok: Listing,
    Err: MarketplaceError,
  })
  const CreateListingArg = IDL.Record({
    token_id: IDL.Nat,
    collection: IDL.Principal,
    price_e8s: IDL.Nat,
  })
  const Category = IDL.Variant({
    Sns: IDL.Null,
    Spam: IDL.Null,
    Native: IDL.Null,
    Known: IDL.Null,
    ChainFusionTestnet: IDL.Null,
    ChainFusion: IDL.Null,
    Community: IDL.Null,
  })
  const ICRC1 = IDL.Record({
    fee: IDL.Nat,
    root_canister_id: IDL.Opt(IDL.Text),
    decimals: IDL.Nat8,
    logo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    date_added: IDL.Nat64,
    ledger: IDL.Text,
    category: Category,
    index: IDL.Opt(IDL.Text),
    symbol: IDL.Text,
  })
  const NeuronData = IDL.Record({
    name: IDL.Text,
    date_added: IDL.Nat64,
    ledger: IDL.Text,
    neuron_id: IDL.Text,
  })
  const HistoricalBid = IDL.Record({
    bid_amount_e8s: IDL.Nat,
    app_id: IDL.Nat32,
    bid_time_ns: IDL.Nat64,
    bidder: IDL.Principal,
  })
  const DiscoveryStatus = IDL.Variant({
    New: IDL.Null,
    Spam: IDL.Null,
    Updated: IDL.Null,
    Verified: IDL.Null,
  })
  const DiscoveryApp = IDL.Record({
    id: IDL.Nat32,
    url: IDL.Opt(IDL.Text),
    derivation_origin: IDL.Opt(IDL.Text),
    status: DiscoveryStatus,
    desc: IDL.Opt(IDL.Text),
    name: IDL.Opt(IDL.Text),
    is_global: IDL.Bool,
    hostname: IDL.Text,
    unique_users: IDL.Nat64,
    is_anonymous: IDL.Bool,
    image: IDL.Opt(IDL.Text),
  })
  const ListingSort = IDL.Variant({
    Oldest: IDL.Null,
    PriceDesc: IDL.Null,
    PriceAsc: IDL.Null,
    Newest: IDL.Null,
  })
  const ListingQuery = IDL.Record({
    collection: IDL.Opt(IDL.Principal),
    sort: IDL.Opt(ListingSort),
    offset: IDL.Nat64,
    limit: IDL.Nat64,
  })
  const ListingPage = IDL.Record({
    total: IDL.Nat64,
    items: IDL.Vec(Listing),
  })
  const MarketplaceConfig = IDL.Record({
    min_price_e8s: IDL.Nat,
    icp_ledger: IDL.Principal,
    max_retries: IDL.Nat32,
  })
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })
  const UserDiscoveryApp = IDL.Record({
    anonymous_principal: IDL.Text,
    app_id: IDL.Nat32,
  })
  const NftCollectionStatus = IDL.Variant({
    Spam: IDL.Null,
    Hidden: IDL.Null,
    Verified: IDL.Null,
    Community: IDL.Null,
  })
  const NftCollection = IDL.Record({
    status: NftCollectionStatus,
    logo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    canister_id: IDL.Principal,
    description: IDL.Opt(IDL.Text),
    date_added: IDL.Nat64,
    symbol: IDL.Text,
  })
  const FeaturedSlot = IDL.Record({
    locked_until_ns: IDL.Nat64,
    bid_amount_e8s: IDL.Nat,
    app_id: IDL.Nat32,
    bid_time_ns: IDL.Nat64,
    bidder: IDL.Principal,
    expires_at_ns: IDL.Nat64,
  })
  const PromotionConfig = IDL.Record({
    locked_period_ns: IDL.Nat64,
    min_bid_e8s: IDL.Nat,
    bid_increment_e8s: IDL.Nat,
    feature_duration_ns: IDL.Nat64,
    ledger_canister: IDL.Principal,
    treasury: IDL.Principal,
  })
  const PromotionStatus = IDL.Record({
    featured: IDL.Opt(FeaturedSlot),
    now_ns: IDL.Nat64,
    min_next_bid_e8s: IDL.Nat,
    locked: IDL.Bool,
    config: PromotionConfig,
  })
  const LoginType = IDL.Variant({
    Anonymous: IDL.Null,
    Global: IDL.Null,
  })
  const DiscoveryVisitRequest = IDL.Record({
    derivation_origin: IDL.Opt(IDL.Text),
    anonymous_principal: IDL.Opt(IDL.Principal),
    hostname: IDL.Text,
    login: LoginType,
  })
  const PlaceBidArg = IDL.Record({
    amount_e8s: IDL.Nat,
    app_id: IDL.Nat32,
  })
  const PlaceBidError = IDL.Variant({
    BelowFloor: IDL.Record({ floor_e8s: IDL.Nat }),
    UnknownApp: IDL.Null,
    BelowIncrement: IDL.Record({ required_e8s: IDL.Nat }),
    Locked: IDL.Record({ until_ns: IDL.Nat64 }),
    NotConfigured: IDL.Null,
    TransferFailed: IDL.Text,
  })
  const PlaceBidResult = IDL.Variant({
    Ok: FeaturedSlot,
    Err: PlaceBidError,
  })
  const ICRC1Request = IDL.Record({
    fee: IDL.Nat,
    decimals: IDL.Nat8,
    logo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    ledger: IDL.Text,
    index: IDL.Opt(IDL.Text),
    symbol: IDL.Text,
  })
  const NftCollectionRequest = IDL.Record({
    logo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    canister_id: IDL.Principal,
    description: IDL.Opt(IDL.Text),
    symbol: IDL.Text,
  })
  return IDL.Service({
    allow_signing: IDL.Func([], [], []),
    btc_select_user_utxos_fee: IDL.Func(
      [SelectedUtxosFeeRequest],
      [BtcSelectUserUtxosFeeResult],
      [],
    ),
    buy_listing: IDL.Func([IDL.Nat64], [MarketTxResult], []),
    cancel_listing: IDL.Func([IDL.Nat64], [ListingResult], []),
    clear_discovery_apps: IDL.Func([], [], []),
    close_marketplace_tx: IDL.Func([IDL.Nat64, IDL.Text], [MarketTxResult], []),
    count_bid_history: IDL.Func([], [IDL.Nat64], ["query"]),
    count_discovery_apps: IDL.Func([], [IDL.Nat64], ["query"]),
    count_icrc1_canisters: IDL.Func([], [IDL.Nat64], ["query"]),
    count_marketplace_txs: IDL.Func([], [IDL.Nat64], ["query"]),
    count_nft_collections: IDL.Func([], [IDL.Nat64], ["query"]),
    create_listing: IDL.Func([CreateListingArg], [ListingResult], []),
    get_all_icrc1_canisters: IDL.Func([], [IDL.Vec(ICRC1)], ["query"]),
    get_all_neurons: IDL.Func([], [IDL.Vec(NeuronData)], ["query"]),
    get_bid_history_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(HistoricalBid)],
      ["query"],
    ),
    get_discovery_app_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(DiscoveryApp)],
      ["query"],
    ),
    get_icrc1_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(ICRC1)],
      ["query"],
    ),
    get_listing: IDL.Func([IDL.Nat64], [IDL.Opt(Listing)], ["query"]),
    get_listings: IDL.Func([ListingQuery], [ListingPage], ["query"]),
    get_listings_by_seller: IDL.Func(
      [IDL.Principal, IDL.Nat64, IDL.Nat64],
      [IDL.Vec(Listing)],
      ["query"],
    ),
    get_marketplace_config: IDL.Func(
      [],
      [IDL.Opt(MarketplaceConfig)],
      ["query"],
    ),
    get_marketplace_escrow: IDL.Func([], [Account], ["query"]),
    get_marketplace_tx: IDL.Func([IDL.Nat64], [IDL.Opt(MarketTx)], ["query"]),
    get_marketplace_txs_by_user: IDL.Func(
      [IDL.Principal, IDL.Nat64, IDL.Nat64],
      [IDL.Vec(MarketTx)],
      ["query"],
    ),
    get_marketplace_txs_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(MarketTx)],
      ["query"],
    ),
    get_my_discovery_apps: IDL.Func([], [IDL.Vec(UserDiscoveryApp)], []),
    get_nft_collection: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(NftCollection)],
      ["query"],
    ),
    get_nft_collections_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(NftCollection)],
      ["query"],
    ),
    get_pending_marketplace_txs: IDL.Func([], [IDL.Vec(MarketTx)], ["query"]),
    get_promotion_status: IDL.Func([], [PromotionStatus], ["query"]),
    is_unique: IDL.Func([DiscoveryVisitRequest], [IDL.Bool], ["query"]),
    place_bid: IDL.Func([PlaceBidArg], [PlaceBidResult], []),
    remove_icrc1_canister: IDL.Func([IDL.Text], [], []),
    remove_nft_collection: IDL.Func([IDL.Principal], [], []),
    replace_all_discovery_app: IDL.Func([IDL.Vec(DiscoveryApp)], [], []),
    replace_all_neurons: IDL.Func([IDL.Vec(NeuronData)], [], []),
    replace_icrc1_canisters: IDL.Func([IDL.Vec(ICRC1)], [], []),
    replace_nft_collections: IDL.Func([IDL.Vec(NftCollection)], [], []),
    retry_marketplace_tx: IDL.Func([IDL.Nat64, IDL.Bool], [MarketTxResult], []),
    run_marketplace_clock: IDL.Func([], [IDL.Nat32], []),
    set_marketplace_config: IDL.Func([MarketplaceConfig], [], []),
    set_nft_collection_status: IDL.Func(
      [IDL.Principal, NftCollectionStatus],
      [],
      [],
    ),
    set_operator: IDL.Func([IDL.Principal], [], []),
    set_promotion_config: IDL.Func([PromotionConfig], [], []),
    store_discovery_app: IDL.Func([DiscoveryVisitRequest], [], []),
    store_icrc1_canister: IDL.Func([ICRC1Request], [], []),
    store_new_icrc1_canisters: IDL.Func([IDL.Vec(ICRC1)], [], []),
    store_nft_collection: IDL.Func([NftCollectionRequest], [], []),
    veto_current_featured: IDL.Func([], [], []),
  })
}
export const init = ({ IDL }: any) => {
  const Conf = IDL.Record({
    operator: IDL.Opt(IDL.Principal),
    im_canister: IDL.Opt(IDL.Principal),
  })
  return [IDL.Opt(Conf)]
}

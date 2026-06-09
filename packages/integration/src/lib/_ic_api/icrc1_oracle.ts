export const idlFactory = ({ IDL }: any) => {
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
  const ICRC1Request = IDL.Record({
    fee: IDL.Nat,
    decimals: IDL.Nat8,
    logo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    ledger: IDL.Text,
    index: IDL.Opt(IDL.Text),
    symbol: IDL.Text,
  })
  const LoginType = IDL.Variant({ Global: IDL.Null, Anonymous: IDL.Null })
  const DiscoveryStatus = IDL.Variant({
    New: IDL.Null,
    Updated: IDL.Null,
    Verified: IDL.Null,
    Spam: IDL.Null,
  })
  const DiscoveryVisitRequest = IDL.Record({
    derivation_origin: IDL.Opt(IDL.Text),
    hostname: IDL.Text,
    login: LoginType,
    anonymous_principal: IDL.Opt(IDL.Principal),
  })
  const UserDiscoveryApp = IDL.Record({
    app_id: IDL.Nat32,
    anonymous_principal: IDL.Text,
  })
  const DiscoveryApp = IDL.Record({
    id: IDL.Nat32,
    derivation_origin: IDL.Opt(IDL.Text),
    hostname: IDL.Text,
    url: IDL.Opt(IDL.Text),
    name: IDL.Opt(IDL.Text),
    image: IDL.Opt(IDL.Text),
    desc: IDL.Opt(IDL.Text),
    is_global: IDL.Bool,
    is_anonymous: IDL.Bool,
    unique_users: IDL.Nat64,
    status: DiscoveryStatus,
  })
  const PromotionConfig = IDL.Record({
    min_bid_e8s: IDL.Nat,
    bid_increment_e8s: IDL.Nat,
    locked_period_ns: IDL.Nat64,
    feature_duration_ns: IDL.Nat64,
    ledger_canister: IDL.Principal,
    treasury: IDL.Principal,
  })
  const FeaturedSlot = IDL.Record({
    app_id: IDL.Nat32,
    bidder: IDL.Principal,
    bid_amount_e8s: IDL.Nat,
    bid_time_ns: IDL.Nat64,
    locked_until_ns: IDL.Nat64,
    expires_at_ns: IDL.Nat64,
  })
  const HistoricalBid = IDL.Record({
    app_id: IDL.Nat32,
    bidder: IDL.Principal,
    bid_amount_e8s: IDL.Nat,
    bid_time_ns: IDL.Nat64,
  })
  const PromotionStatus = IDL.Record({
    config: PromotionConfig,
    featured: IDL.Opt(FeaturedSlot),
    min_next_bid_e8s: IDL.Nat,
    locked: IDL.Bool,
    now_ns: IDL.Nat64,
  })
  const PlaceBidArg = IDL.Record({
    app_id: IDL.Nat32,
    amount_e8s: IDL.Nat,
  })
  const PlaceBidError = IDL.Variant({
    Locked: IDL.Record({ until_ns: IDL.Nat64 }),
    BelowFloor: IDL.Record({ floor_e8s: IDL.Nat }),
    BelowIncrement: IDL.Record({ required_e8s: IDL.Nat }),
    UnknownApp: IDL.Null,
    TransferFailed: IDL.Text,
    NotConfigured: IDL.Null,
  })
  const PlaceBidResult = IDL.Variant({
    Ok: FeaturedSlot,
    Err: PlaceBidError,
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
  return IDL.Service({
    allow_signing: IDL.Func([], [], []),
    btc_select_user_utxos_fee: IDL.Func(
      [SelectedUtxosFeeRequest],
      [BtcSelectUserUtxosFeeResult],
      [],
    ),
    count_icrc1_canisters: IDL.Func([], [IDL.Nat64], ["query"]),
    get_all_icrc1_canisters: IDL.Func([], [IDL.Vec(ICRC1)], ["query"]),
    get_all_neurons: IDL.Func([], [IDL.Vec(NeuronData)], ["query"]),
    get_icrc1_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(ICRC1)],
      ["query"],
    ),
    remove_icrc1_canister: IDL.Func([IDL.Text], [], []),
    replace_all_neurons: IDL.Func([IDL.Vec(NeuronData)], [], []),
    replace_icrc1_canisters: IDL.Func([IDL.Vec(ICRC1)], [], []),
    set_operator: IDL.Func([IDL.Principal], [], []),
    store_icrc1_canister: IDL.Func([ICRC1Request], [], []),
    store_new_icrc1_canisters: IDL.Func([IDL.Vec(ICRC1)], [], []),
    count_discovery_apps: IDL.Func([], [IDL.Nat64], ["query"]),
    store_discovery_app: IDL.Func([DiscoveryVisitRequest], [], []),
    is_unique: IDL.Func([DiscoveryVisitRequest], [IDL.Bool], ["query"]),
    get_my_discovery_apps: IDL.Func([], [IDL.Vec(UserDiscoveryApp)], []),
    get_discovery_app_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(DiscoveryApp)],
      ["query"],
    ),
    replace_all_discovery_app: IDL.Func([IDL.Vec(DiscoveryApp)], [], []),
    clear_discovery_apps: IDL.Func([], [], []),
    set_promotion_config: IDL.Func([PromotionConfig], [], []),
    get_promotion_status: IDL.Func([], [PromotionStatus], ["query"]),
    place_bid: IDL.Func([PlaceBidArg], [PlaceBidResult], []),
    veto_current_featured: IDL.Func([], [], []),
    count_bid_history: IDL.Func([], [IDL.Nat64], ["query"]),
    get_bid_history_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(HistoricalBid)],
      ["query"],
    ),
  })
}

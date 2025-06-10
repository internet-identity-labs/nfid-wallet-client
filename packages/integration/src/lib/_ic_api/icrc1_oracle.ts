export const idlFactory = ({ IDL }: { IDL: any }) => {
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
  })
}

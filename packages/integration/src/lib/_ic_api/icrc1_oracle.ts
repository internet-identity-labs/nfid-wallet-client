export const idlFactory = ({ IDL }: any) => {
  const Conf = IDL.Record({
    controllers: IDL.Opt(IDL.Vec(IDL.Principal)),
    im_canister: IDL.Opt(IDL.Principal),
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
    decimals: IDL.Nat8,
    logo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    ledger: IDL.Text,
    category: Category,
    index: IDL.Opt(IDL.Text),
    root_canister_id: IDL.Opt(IDL.Text),
    symbol: IDL.Text,
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
    allow_signing : IDL.Func([], [], []),
    count_icrc1_canisters: IDL.Func([], [IDL.Nat64], ["query"]),
    get_all_icrc1_canisters: IDL.Func([], [IDL.Vec(ICRC1)], ["query"]),
    get_icrc1_paginated: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(ICRC1)],
      ["query"],
    ),
    replace_icrc1_canisters: IDL.Func([IDL.Vec(ICRC1)], [], []),
    store_icrc1_canister: IDL.Func([ICRC1Request], [], []),
    store_new_icrc1_canisters: IDL.Func([IDL.Vec(ICRC1)], [], []),
    sync_controllers: IDL.Func([], [IDL.Vec(IDL.Text)], []),
  })
}

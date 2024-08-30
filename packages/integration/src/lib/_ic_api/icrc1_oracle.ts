export const idlFactory = ({ IDL }: any) => {
  const Conf = IDL.Record({
    controllers: IDL.Opt(IDL.Vec(IDL.Principal)),
    im_canister: IDL.Opt(IDL.Principal),
  })
  const Category = IDL.Variant({
    Sns: IDL.Null,
    Known: IDL.Null,
    Unknown: IDL.Null,
    ChainFusionTestnet: IDL.Null,
    ChainFusion: IDL.Null,
    Community: IDL.Null,
  })
  const ICRC1 = IDL.Record({
    logo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    ledger: IDL.Text,
    category: Category,
    index: IDL.Opt(IDL.Text),
    symbol: IDL.Text,
  })
  const ICRC1Request = IDL.Record({
    logo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    ledger: IDL.Text,
    index: IDL.Opt(IDL.Text),
    symbol: IDL.Text,
  })
  return IDL.Service({
    get_all_icrc1_canisters: IDL.Func([], [IDL.Vec(ICRC1)], ["query"]),
    save_all_icrc1_canisters: IDL.Func([IDL.Vec(ICRC1)], [IDL.Vec(ICRC1)], []),
    store_icrc1_canister: IDL.Func([ICRC1Request], [], []),
  })
}

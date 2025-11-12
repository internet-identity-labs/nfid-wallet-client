export const idlFactory = ({ IDL }: any) => {
  const Conf = IDL.Record({ im_canister: IDL.Opt(IDL.Text) })
  const ICRC1State = IDL.Variant({
    Inactive: IDL.Null,
    Active: IDL.Null,
  })
  const ICRC1 = IDL.Record({
    state: ICRC1State,
    ledger: IDL.Text,
    network: IDL.Nat32,
  })
  return IDL.Service({
    get_canisters_by_root: IDL.Func([IDL.Text], [IDL.Vec(ICRC1)], ["query"]),
    remove_icrc1_canister: IDL.Func([IDL.Text], [], []),
    store_icrc1_canister: IDL.Func(
      [IDL.Text, ICRC1State, IDL.Opt(IDL.Nat32)],
      [],
      [],
    ),
  })
}

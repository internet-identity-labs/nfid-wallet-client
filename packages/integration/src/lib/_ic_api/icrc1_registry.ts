export const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    add_icrc1_canister: IDL.Func([IDL.Text], [], []),
    get_canisters: IDL.Func([], [IDL.Vec(IDL.Text)], ["query"]),
    get_canisters_by_root: IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ["query"]),
    store_icrc1_canister: IDL.Func([IDL.Text], [], []),
  })
}
export const init = ({ IDL }: any) => {
  return []
}

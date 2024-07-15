export const idlFactory = ({ IDL }: any) => {
  const InitArgs = IDL.Record({ im_canister: IDL.Principal })
  return IDL.Service({
    get_passkey: IDL.Func([], [IDL.Opt(IDL.Text)], ["query"]),
    store_passkey: IDL.Func([IDL.Text], [IDL.Nat64], []),
  })
}

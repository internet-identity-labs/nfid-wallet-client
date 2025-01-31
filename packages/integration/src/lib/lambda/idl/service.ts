export const idlFactory = ({ IDL }: any) => {
  const InitArgs = IDL.Record({
    ecdsa_salt: IDL.Text,
    salt: IDL.Text,
    im_canister: IDL.Principal,
  })
  return IDL.Service({
    get_anon_salt: IDL.Func([IDL.Text], [IDL.Text], []),
    get_salt: IDL.Func([], [IDL.Text], []),
  })
}

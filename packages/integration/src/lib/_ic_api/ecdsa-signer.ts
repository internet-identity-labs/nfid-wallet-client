export const idlFactory = ({ IDL }: any) => {
  const KeyPair = IDL.Record({
    public_key: IDL.Text,
    private_key_encrypted: IDL.Text,
  })
  const KeyPairResponse = IDL.Record({
    key_pair: IDL.Opt(KeyPair),
    princ: IDL.Text,
  })
  const CertifiedKeyPairResponse = IDL.Record({
    certificate: IDL.Vec(IDL.Nat8),
    witness: IDL.Vec(IDL.Nat8),
    response: KeyPairResponse,
  })
  return IDL.Service({
    add_kp: IDL.Func([KeyPair], [], []),
    get_kp: IDL.Func([], [KeyPairResponse], []),
    get_kp_certified: IDL.Func(
      [IDL.Text],
      [CertifiedKeyPairResponse],
      ["query"],
    ),
    get_principal: IDL.Func(
      [IDL.Opt(IDL.Text)],
      [IDL.Text, IDL.Opt(IDL.Text)],
      ["query"],
    ),
    get_public_key: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
    get_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], []),
  })
}
export const init = ({ IDL }: any) => {
  return []
}

export const idlFactory = ({ IDL }: any) => {
  const Conf = IDL.Record({ key: IDL.Text, price: IDL.Nat64 })
  const PublicKeyReply = IDL.Record({ public_key: IDL.Vec(IDL.Nat8) })
  const Result = IDL.Variant({ Ok: PublicKeyReply, Err: IDL.Text })
  const SignatureReply = IDL.Record({ signature: IDL.Vec(IDL.Nat8) })
  const Result_1 = IDL.Variant({ Ok: SignatureReply, Err: IDL.Text })
  return IDL.Service({
    public_key: IDL.Func([], [Result], []),
    sign: IDL.Func([IDL.Vec(IDL.Nat8)], [Result_1], []),
    prepare_signature: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Text], []),
    get_signature: IDL.Func([IDL.Text], [Result_1], ["query"]),
  })
}
export const init = ({ IDL }: any) => {
  const Conf = IDL.Record({ key: IDL.Text, price: IDL.Nat64 })
  return [IDL.Opt(Conf)]
}

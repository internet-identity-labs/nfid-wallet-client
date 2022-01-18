// TODO: add types for IDL
export const keySync_idlFactory = ({ IDL }: any) => {
  const PublicKey = IDL.Text
  const Ciphertext = IDL.Text
  const GetCiphertextError = IDL.Variant({
    notSynced: IDL.Null,
    notFound: IDL.Null,
  })
  const Result = IDL.Variant({ ok: Ciphertext, err: GetCiphertextError })
  const DeviceAlias = IDL.Text
  const KeySync = IDL.Service({
    get_ciphertext: IDL.Func([PublicKey], [Result], ["query"]),
    get_devices: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(DeviceAlias, PublicKey))],
      ["query"],
    ),
    get_unsynced_pubkeys: IDL.Func([], [IDL.Vec(PublicKey)], ["query"]),
    isSeeded: IDL.Func([], [IDL.Bool], ["query"]),
    register_device: IDL.Func([DeviceAlias, PublicKey], [IDL.Bool], []),
    remove_device: IDL.Func([DeviceAlias], [], ["oneway"]),
    seed: IDL.Func([PublicKey, Ciphertext], [], ["oneway"]),
    submit_ciphertexts: IDL.Func(
      [IDL.Vec(IDL.Tuple(PublicKey, Ciphertext))],
      [],
      ["oneway"],
    ),
    whoami: IDL.Func([], [IDL.Principal], ["query"]),
  })
  return KeySync
}

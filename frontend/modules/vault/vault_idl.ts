// TODO: add types for IDL
export const vaultIdlFactory = ({ IDL }: any) =>
  IDL.Service({
    insert: IDL.Func([IDL.Text, IDL.Text], [], ["update"]),
    get_kvstore: IDL.Func(
      [],
      [IDL.Vec(IDL.Record({ key: IDL.Text, value: IDL.Text }))],
      [],
    ),
    delete: IDL.Func([IDL.Text], [], []),
    lookup: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], []),
    replace: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(IDL.Text)], []),
  })

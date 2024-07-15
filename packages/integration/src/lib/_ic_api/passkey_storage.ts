export const idlFactory = ({ IDL } : any) => {
  const PassKeyData = IDL.Record({ 'data' : IDL.Text, 'key' : IDL.Text });
  return IDL.Service({
    'get_passkey' : IDL.Func([IDL.Vec(IDL.Text)], [IDL.Vec(PassKeyData)], ['query'],),
    'store_passkey' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat64], []),
  });
};

export const idlFactory = ({ IDL }: any) => {
  const GetBtcAddressResponse = IDL.Record({
    address: IDL.Text,
    derivation_path: IDL.Text,
  });

  const DepositStatus = IDL.Record({
    address: IDL.Text,
    amount: IDL.Nat64,
    status: IDL.Variant({
      pending: IDL.Null,
      confirmed: IDL.Null,
      failed: IDL.Null,
    }),
    tx_id: IDL.Text,
    created_at: IDL.Nat64,
    confirmed_at: IDL.Opt(IDL.Nat64),
  });

  return IDL.Service({
    get_btc_address: IDL.Func([], [GetBtcAddressResponse], ["query"]),
    get_deposit_status: IDL.Func([IDL.Text], [DepositStatus], ["query"]),
  });
}; 
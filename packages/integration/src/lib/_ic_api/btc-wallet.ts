export const idlFactory = ({ IDL }: any) => {
  const network = IDL.Variant({
    'Mainnet' : IDL.Null,
    'Regtest' : IDL.Null,
    'Testnet' : IDL.Null,
  });
  const bitcoin_address = IDL.Text;
  const satoshi = IDL.Nat64;
  const millisatoshi_per_byte = IDL.Nat64;
  const block_hash = IDL.Vec(IDL.Nat8);
  const outpoint = IDL.Record({
    'txid' : IDL.Vec(IDL.Nat8),
    'vout' : IDL.Nat32,
  });
  const utxo = IDL.Record({
    'height' : IDL.Nat32,
    'value' : satoshi,
    'outpoint' : outpoint,
  });
  const get_utxos_response = IDL.Record({
    'next_page' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'tip_height' : IDL.Nat32,
    'tip_block_hash' : block_hash,
    'utxos' : IDL.Vec(utxo),
  });
  return IDL.Service({
    'get_balance' : IDL.Func([bitcoin_address], [satoshi], []),
    'get_current_fee_percentiles' : IDL.Func(
      [],
      [IDL.Vec(millisatoshi_per_byte)],
      [],
    ),
    'get_p2pkh_address' : IDL.Func([], [bitcoin_address], []),
    'get_utxos' : IDL.Func([bitcoin_address], [get_utxos_response], []),
    'send' : IDL.Func(
      [
        IDL.Record({
          'destination_address' : bitcoin_address,
          'amount_in_satoshi' : satoshi,
        }),
      ],
      [IDL.Text],
      [],
    ),
  });
};
export const init = ({ IDL }: any) => {
  const network = IDL.Variant({
    'Mainnet' : IDL.Null,
    'Regtest' : IDL.Null,
    'Testnet' : IDL.Null,
  });
  return [network];
};

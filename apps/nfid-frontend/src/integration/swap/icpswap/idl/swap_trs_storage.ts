export const idlFactory = ({ IDL }: any) => {
  const Error = IDL.Record({ time: IDL.Nat64, message: IDL.Text })
  const SwapStage = IDL.Variant({
    Withdraw: IDL.Null,
    Deposit: IDL.Null,
    Swap: IDL.Null,
    Completed: IDL.Null,
    TransferNFID: IDL.Null,
    TransferSwap: IDL.Null,
  })
  const SwapTransaction = IDL.Record({
    uid: IDL.Text,
    withdraw: IDL.Opt(IDL.Nat),
    swap: IDL.Opt(IDL.Nat),
    errors: IDL.Vec(Error),
    deposit: IDL.Opt(IDL.Nat),
    end_time: IDL.Opt(IDL.Nat64),
    transfer_id: IDL.Opt(IDL.Nat64),
    target_ledger: IDL.Text,
    stage: SwapStage,
    start_time: IDL.Nat64,
    source_ledger: IDL.Text,
    transfer_nfid_id: IDL.Opt(IDL.Nat64),
    target_amount: IDL.Nat,
    source_amount: IDL.Nat,
  })
  return IDL.Service({
    get_transactions: IDL.Func(
      [IDL.Text],
      [IDL.Vec(SwapTransaction)],
      ["query"],
    ),
    store_transaction: IDL.Func([SwapTransaction], [], []),
  })
}

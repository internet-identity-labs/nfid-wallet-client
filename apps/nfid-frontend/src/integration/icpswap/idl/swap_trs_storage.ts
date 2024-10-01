export const idlFactory = ({ IDL }: any) => {
  const InitArgs = IDL.Record({ im_canister: IDL.Principal })
  const SwapStage = IDL.Variant({
    Withdraw: IDL.Null,
    Error: IDL.Null,
    Deposit: IDL.Null,
    Swap: IDL.Null,
    Transfer: IDL.Null,
    Completed: IDL.Null,
  })
  const SwapTransaction = IDL.Record({
    withdraw: IDL.Nat64,
    swap: IDL.Nat64,
    deposit: IDL.Nat64,
    end_time: IDL.Nat64,
    transfer_id: IDL.Nat64,
    target_ledger: IDL.Text,
    error: IDL.Opt(IDL.Text),
    stage: SwapStage,
    start_time: IDL.Nat64,
    source_ledger: IDL.Text,
    transfer_nfid_id: IDL.Nat64,
    target_amount: IDL.Nat64,
    source_amount: IDL.Nat64,
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
export const init = ({ IDL }: any) => {
  const InitArgs = IDL.Record({ im_canister: IDL.Principal })
  return [IDL.Opt(InitArgs)]
}

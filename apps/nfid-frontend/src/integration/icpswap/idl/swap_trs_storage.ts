export const idlFactory = ({ IDL }: any) => {
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
    withdraw: IDL.Opt(IDL.Nat64),
    swap: IDL.Opt(IDL.Nat64),
    deposit: IDL.Opt(IDL.Nat64),
    end_time: IDL.Opt(IDL.Nat64),
    transfer_id: IDL.Opt(IDL.Nat64),
    target_ledger: IDL.Text,
    error: IDL.Opt(IDL.Text),
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
export const init = ({ IDL }: any) => {
  const InitArgs = IDL.Record({ im_canister: IDL.Principal })
  return [IDL.Opt(InitArgs)]
}

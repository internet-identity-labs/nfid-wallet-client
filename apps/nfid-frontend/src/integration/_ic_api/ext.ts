export const extIDL = ({ IDL }: any) => {
  const SubAccount = IDL.Vec(IDL.Nat8)
  const AccountIdentifier = IDL.Text
  const TokenIdentifier = IDL.Text
  const User = IDL.Variant({
    principal: IDL.Principal,
    address: AccountIdentifier,
  })
  const Balance = IDL.Nat
  const Memo = IDL.Vec(IDL.Nat8)
  const MemoExt = IDL.Nat64
  const TransferRequest = IDL.Record({
    to: User,
    token: TokenIdentifier,
    notify: IDL.Bool,
    from: User,
    memo: Memo,
    subaccount: IDL.Opt(SubAccount),
    amount: Balance,
  })
  const Result = IDL.Variant({
    ok: Balance,
    err: IDL.Variant({
      CannotNotify: AccountIdentifier,
      InsufficientBalance: IDL.Null,
      InvalidToken: TokenIdentifier,
      Rejected: IDL.Null,
      Unauthorized: AccountIdentifier,
      Other: IDL.Text,
    }),
  })
  const CommonError = IDL.Variant({
    InvalidToken: TokenIdentifier,
    Other: IDL.Text,
  })
  const LockResult = IDL.Variant({
    ok: AccountIdentifier,
    err: CommonError,
  })
  const ListRequest = IDL.Record({
    token: TokenIdentifier,
    from_subaccount: IDL.Opt(SubAccount),
    price: IDL.Opt(IDL.Nat64),
  })
  const ICPTs = IDL.Record({ e8s: IDL.Nat64 })
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 })
  const BlockHeight = IDL.Nat64
  const SendArgs = IDL.Record({
    to: AccountIdentifier,
    fee: ICPTs,
    memo: MemoExt,
    from_subaccount: IDL.Opt(SubAccount),
    created_at_time: IDL.Opt(TimeStamp),
    amount: ICPTs,
  })
  const Result_3 = IDL.Variant({ ok: IDL.Null, err: CommonError })
  return IDL.Service({
    transfer: IDL.Func([TransferRequest], [Result], []),
    lock: IDL.Func(
      [TokenIdentifier, IDL.Nat64, AccountIdentifier, SubAccount],
      [LockResult],
      [],
    ),
    list: IDL.Func([ListRequest], [Result_3], []),
    send_dfx: IDL.Func([SendArgs], [BlockHeight], []),
    settle: IDL.Func([TokenIdentifier], [Result_3], []),
  })
}
export const init = ({ IDL: _IDL }: any) => {
  return []
}

export const extIDL = ({ IDL }) => {
  const SubAccount_2 = IDL.Vec(IDL.Nat8)
  const AccountIdentifier = IDL.Text
  const TokenIdentifier_2 = IDL.Text
  const User = IDL.Variant({
    principal: IDL.Principal,
    address: AccountIdentifier,
  })
  const Balance = IDL.Nat
  const Memo = IDL.Vec(IDL.Nat8)
  const TransferRequest = IDL.Record({
    to: User,
    token: TokenIdentifier_2,
    notify: IDL.Bool,
    from: User,
    memo: Memo,
    subaccount: IDL.Opt(SubAccount_2),
    amount: Balance,
  })
  const Result = IDL.Variant({
    ok: Balance,
    err: IDL.Variant({
      CannotNotify: AccountIdentifier,
      InsufficientBalance: IDL.Null,
      InvalidToken: TokenIdentifier_2,
      Rejected: IDL.Null,
      Unauthorized: AccountIdentifier,
      Other: IDL.Text,
    }),
  })
  return IDL.Service({
    transfer: IDL.Func([TransferRequest], [Result], []),
  })
}
export const init = ({ IDL }) => {
  return []
}

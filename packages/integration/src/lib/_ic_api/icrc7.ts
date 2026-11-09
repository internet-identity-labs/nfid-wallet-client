// Minimal ICRC-7 / ICRC-37 interface used by the NFID marketplace.
//
// icrc37_approve_tokens / icrc37_revoke_token_approvals are typed as
// `reserved` on return: collections differ in the result shape (the spec
// returns `vec opt Result`, ORIGYN core_nft wraps it in an outer Result).
// The effect is verified afterwards with `icrc37_is_approved`.
export const idlFactory = ({ IDL }: any) => {
  const Value = IDL.Rec()
  Value.fill(
    IDL.Variant({
      Int: IDL.Int,
      Map: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
      Nat: IDL.Nat,
      Blob: IDL.Vec(IDL.Nat8),
      Text: IDL.Text,
      Array: IDL.Vec(Value),
    }),
  )
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })
  const ApprovalInfo = IDL.Record({
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Nat64,
    expires_at: IDL.Opt(IDL.Nat64),
    spender: Account,
  })
  const ApproveTokenArg = IDL.Record({
    token_id: IDL.Nat,
    approval_info: ApprovalInfo,
  })
  const RevokeTokenApprovalArg = IDL.Record({
    token_id: IDL.Nat,
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    spender: IDL.Opt(Account),
  })
  const IsApprovedArg = IDL.Record({
    token_id: IDL.Nat,
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    spender: Account,
  })
  return IDL.Service({
    icrc7_name: IDL.Func([], [IDL.Text], ["query"]),
    icrc7_symbol: IDL.Func([], [IDL.Text], ["query"]),
    icrc7_description: IDL.Func([], [IDL.Opt(IDL.Text)], ["query"]),
    icrc7_logo: IDL.Func([], [IDL.Opt(IDL.Text)], ["query"]),
    icrc7_owner_of: IDL.Func(
      [IDL.Vec(IDL.Nat)],
      [IDL.Vec(IDL.Opt(Account))],
      ["query"],
    ),
    icrc7_tokens_of: IDL.Func(
      [Account, IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],
      [IDL.Vec(IDL.Nat)],
      ["query"],
    ),
    icrc7_token_metadata: IDL.Func(
      [IDL.Vec(IDL.Nat)],
      [IDL.Vec(IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, Value))))],
      ["query"],
    ),
    icrc37_is_approved: IDL.Func(
      [IDL.Vec(IsApprovedArg)],
      [IDL.Vec(IDL.Bool)],
      ["query"],
    ),
    icrc37_approve_tokens: IDL.Func(
      [IDL.Vec(ApproveTokenArg)],
      [IDL.Reserved],
      [],
    ),
    icrc37_revoke_token_approvals: IDL.Func(
      [IDL.Vec(RevokeTokenApprovalArg)],
      [IDL.Reserved],
      [],
    ),
  })
}
export const init = () => []

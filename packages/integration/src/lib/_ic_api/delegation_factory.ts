export const idlFactory = ({ IDL }: any) => {
  const _InitArgs = IDL.Record({ im_canister: IDL.Principal })
  const UserNumber = IDL.Nat64
  const FrontendHostname = IDL.Text
  const PublicKey = IDL.Vec(IDL.Nat8)
  const SessionKey = PublicKey
  const Timestamp = IDL.Nat64
  const Delegation = IDL.Record({
    pubkey: PublicKey,
    targets: IDL.Opt(IDL.Vec(IDL.Principal)),
    expiration: Timestamp,
  })
  const SignedDelegation = IDL.Record({
    signature: IDL.Vec(IDL.Nat8),
    delegation: Delegation,
  })
  const GetDelegationResponse = IDL.Variant({
    no_such_delegation: IDL.Null,
    signed_delegation: SignedDelegation,
  })
  const UserKey = PublicKey
  return IDL.Service({
    get_delegation: IDL.Func(
      [
        UserNumber,
        FrontendHostname,
        SessionKey,
        Timestamp,
        IDL.Opt(IDL.Vec(IDL.Principal)),
      ],
      [GetDelegationResponse],
      ["query"],
    ),
    get_principal: IDL.Func(
      [UserNumber, FrontendHostname],
      [IDL.Principal],
      ["query"],
    ),
    init_salt: IDL.Func([], [], []),
    prepare_delegation: IDL.Func(
      [
        UserNumber,
        FrontendHostname,
        SessionKey,
        IDL.Opt(IDL.Nat64),
        IDL.Opt(IDL.Vec(IDL.Principal)),
      ],
      [UserKey, Timestamp],
      [],
    ),
  })
}
export const init = ({ IDL }: any) => {
  const InitArgs = IDL.Record({ im_canister: IDL.Principal })
  return [IDL.Opt(InitArgs)]
}

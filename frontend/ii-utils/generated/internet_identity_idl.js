export const idlFactory = ({ IDL }) => {
  const InternetIdentityInit = IDL.Record({
    assigned_user_number_range: IDL.Tuple(IDL.Nat64, IDL.Nat64),
  })
  const UserNumber = IDL.Nat64
  const PublicKey = IDL.Vec(IDL.Nat8)
  const DeviceKey = PublicKey
  const KeyType = IDL.Variant({
    platform: IDL.Null,
    seed_phrase: IDL.Null,
    cross_platform: IDL.Null,
    unknown: IDL.Null,
  })
  const Purpose = IDL.Variant({
    authentication: IDL.Null,
    recovery: IDL.Null,
  })
  const CredentialId = IDL.Vec(IDL.Nat8)
  const DeviceData = IDL.Record({
    alias: IDL.Text,
    pubkey: DeviceKey,
    key_type: KeyType,
    purpose: Purpose,
    credential_id: IDL.Opt(CredentialId),
  })
  const DelegationKey = IDL.Text
  const DelegationJson = IDL.Text
  const DelegationJsonResponse = IDL.Record({
    delegation: IDL.Opt(DelegationJson),
    status_code: IDL.Nat16,
  })
  const FrontendHostname = IDL.Text
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
  const ProofOfWork = IDL.Record({
    nonce: IDL.Nat64,
    timestamp: Timestamp,
  })
  const RegisterResponse = IDL.Variant({
    canister_full: IDL.Null,
    registered: IDL.Record({ user_number: UserNumber }),
  })
  const InternetIdentityStats = IDL.Record({
    users_registered: IDL.Nat64,
    assigned_user_number_range: IDL.Tuple(IDL.Nat64, IDL.Nat64),
  })
  return IDL.Service({
    add: IDL.Func([UserNumber, DeviceData], [], []),
    get_delegate: IDL.Func(
      [DelegationKey],
      [DelegationJsonResponse],
      ["query"],
    ),
    get_delegation: IDL.Func(
      [UserNumber, FrontendHostname, SessionKey, Timestamp],
      [GetDelegationResponse],
      ["query"],
    ),
    get_principal: IDL.Func(
      [UserNumber, FrontendHostname],
      [IDL.Principal],
      ["query"],
    ),
    init_salt: IDL.Func([], [], []),
    lookup: IDL.Func([UserNumber], [IDL.Vec(DeviceData)], ["query"]),
    prepare_delegation: IDL.Func(
      [UserNumber, FrontendHostname, SessionKey, IDL.Opt(IDL.Nat64)],
      [UserKey, Timestamp],
      [],
    ),
    put_delegate: IDL.Func(
      [DelegationKey, DelegationJson],
      [DelegationJsonResponse],
      [],
    ),
    register: IDL.Func([DeviceData, ProofOfWork], [RegisterResponse], []),
    remove: IDL.Func([UserNumber, DeviceKey], [], []),
    stats: IDL.Func([], [InternetIdentityStats], ["query"]),
  })
}
export const init = ({ IDL }) => {
  const InternetIdentityInit = IDL.Record({
    assigned_user_number_range: IDL.Tuple(IDL.Nat64, IDL.Nat64),
  })
  return [IDL.Opt(InternetIdentityInit)]
}

export const idlFactory = ({ IDL }: any) => {
  const CertifiedRoot = IDL.Record({
    root: IDL.Text,
    certificate: IDL.Vec(IDL.Nat8),
    witness: IDL.Vec(IDL.Nat8),
  })
  const AnonymousDelegationRequest = IDL.Record({
    certified_root: CertifiedRoot,
    domain: IDL.Text,
    session_key: IDL.Vec(IDL.Nat8),
    targets: IDL.Vec(IDL.Principal),
    delegation_ttl_ms: IDL.Opt(IDL.Nat64),
  })
  const GlobalDelegationRequest = IDL.Record({
    certified_root: CertifiedRoot,
    session_key: IDL.Vec(IDL.Nat8),
    targets: IDL.Vec(IDL.Principal),
    delegation_ttl_ms: IDL.Opt(IDL.Nat64),
  })
  const AnonymousPrincipalRequest = IDL.Record({
    certified_root: CertifiedRoot,
    domain: IDL.Text,
  })
  const Delegation = IDL.Record({
    pubkey: IDL.Vec(IDL.Nat8),
    expiration: IDL.Nat64,
    targets: IDL.Opt(IDL.Vec(IDL.Principal)),
  })
  const SignedDelegation = IDL.Record({
    delegation: Delegation,
    signature: IDL.Vec(IDL.Nat8),
  })
  const DelegationChain = IDL.Record({
    delegations: IDL.Vec(SignedDelegation),
    public_key: IDL.Vec(IDL.Nat8),
  })
  const DelegationResult = IDL.Variant({ Ok: DelegationChain, Err: IDL.Text })
  const SealedSalts = IDL.Record({
    ephemeral_public_key: IDL.Text,
    nonce: IDL.Text,
    ciphertext: IDL.Text,
  })
  const ImportedKeyPair = IDL.Record({
    root: IDL.Text,
    public_key: IDL.Text,
    private_key_encrypted: IDL.Text,
  })
  const Status = IDL.Record({
    im_canister: IDL.Opt(IDL.Principal),
    custom_ic_root_key: IDL.Bool,
    salts_provisioned: IDL.Bool,
    salts_fingerprint: IDL.Opt(IDL.Text),
    provisioning_key_pending: IDL.Bool,
    global_keys: IDL.Nat64,
  })
  return IDL.Service({
    get_anonymous_delegation: IDL.Func(
      [AnonymousDelegationRequest],
      [DelegationResult],
      [],
    ),
    get_global_delegation: IDL.Func(
      [GlobalDelegationRequest],
      [DelegationResult],
      [],
    ),
    get_anonymous_principal: IDL.Func(
      [AnonymousPrincipalRequest],
      [IDL.Variant({ Ok: IDL.Principal, Err: IDL.Text })],
      [],
    ),
    get_provisioning_key: IDL.Func(
      [],
      [IDL.Variant({ Ok: IDL.Text, Err: IDL.Text })],
      [],
    ),
    provision_salts: IDL.Func(
      [SealedSalts],
      [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })],
      [],
    ),
    import_global_keys: IDL.Func(
      [IDL.Vec(ImportedKeyPair)],
      [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
      [],
    ),
    status: IDL.Func(
      [],
      [IDL.Variant({ Ok: Status, Err: IDL.Text })],
      ["query"],
    ),
  })
}
export const init = ({ IDL }: any) => {
  const InitArgs = IDL.Record({
    im_canister: IDL.Principal,
    ic_root_key: IDL.Opt(IDL.Vec(IDL.Nat8)),
  })
  return [IDL.Opt(InitArgs)]
}

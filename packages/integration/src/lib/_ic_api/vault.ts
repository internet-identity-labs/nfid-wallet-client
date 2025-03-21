export const idlFactory = ({ IDL }: any) => {
  const Conf = IDL.Record({ ledger_canister_id: IDL.Principal })
  const TransactionState = IDL.Variant({
    Approved: IDL.Null,
    Rejected: IDL.Null,
    Canceled: IDL.Null,
    Pending: IDL.Null,
  })
  const TransactionApproveRequest = IDL.Record({
    transaction_id: IDL.Nat64,
    state: TransactionState,
  })
  const Approve = IDL.Record({
    status: TransactionState,
    signer: IDL.Text,
    created_date: IDL.Nat64,
  })
  const Currency = IDL.Variant({ ICP: IDL.Null })
  const Transaction = IDL.Record({
    id: IDL.Nat64,
    to: IDL.Text,
    member_threshold: IDL.Nat8,
    block_index: IDL.Opt(IDL.Nat64),
    owner: IDL.Text,
    from: IDL.Text,
    modified_date: IDL.Nat64,
    memo: IDL.Opt(IDL.Text),
    vault_id: IDL.Nat64,
    amount_threshold: IDL.Nat64,
    state: TransactionState,
    approves: IDL.Vec(Approve),
    currency: Currency,
    amount: IDL.Nat64,
    created_date: IDL.Nat64,
    policy_id: IDL.Nat64,
  })
  const ObjectState = IDL.Variant({
    Active: IDL.Null,
    Archived: IDL.Null,
  })
  const ThresholdPolicy = IDL.Record({
    member_threshold: IDL.Opt(IDL.Nat8),
    amount_threshold: IDL.Nat64,
    wallets: IDL.Opt(IDL.Vec(IDL.Text)),
    currency: Currency,
  })
  const PolicyType = IDL.Variant({ threshold_policy: ThresholdPolicy })
  const Policy = IDL.Record({
    id: IDL.Nat64,
    vault: IDL.Nat64,
    modified_date: IDL.Nat64,
    state: ObjectState,
    policy_type: PolicyType,
    created_date: IDL.Nat64,
  })
  const VaultRole = IDL.Variant({ Member: IDL.Null, Admin: IDL.Null })
  const VaultMember = IDL.Record({
    user_uuid: IDL.Text,
    name: IDL.Opt(IDL.Text),
    role: VaultRole,
    state: ObjectState,
  })
  const Vault = IDL.Record({
    id: IDL.Nat64,
    members: IDL.Vec(VaultMember),
    modified_date: IDL.Nat64,
    name: IDL.Text,
    description: IDL.Opt(IDL.Text),
    state: ObjectState,
    wallets: IDL.Vec(IDL.Text),
    created_date: IDL.Nat64,
    policies: IDL.Vec(IDL.Nat64),
  })
  const Wallet = IDL.Record({
    uid: IDL.Text,
    modified_date: IDL.Nat64,
    name: IDL.Opt(IDL.Text),
    vaults: IDL.Vec(IDL.Nat64),
    state: ObjectState,
    created_date: IDL.Nat64,
  })
  const PolicyRegisterRequest = IDL.Record({
    vault_id: IDL.Nat64,
    policy_type: PolicyType,
  })
  const TransactionRegisterRequest = IDL.Record({
    address: IDL.Text,
    amount: IDL.Nat64,
    wallet_id: IDL.Text,
  })
  const VaultRegisterRequest = IDL.Record({
    name: IDL.Text,
    description: IDL.Opt(IDL.Text),
  })
  const WalletRegisterRequest = IDL.Record({
    name: IDL.Opt(IDL.Text),
    vault_id: IDL.Nat64,
  })
  const VaultMemberRequest = IDL.Record({
    name: IDL.Opt(IDL.Text),
    role: VaultRole,
    vault_id: IDL.Nat64,
    state: ObjectState,
    address: IDL.Text,
  })
  return IDL.Service({
    approve_transaction: IDL.Func(
      [TransactionApproveRequest],
      [Transaction],
      [],
    ),
    get_policies: IDL.Func([IDL.Nat64], [IDL.Vec(Policy)], ["query"]),
    get_transactions: IDL.Func([], [IDL.Vec(Transaction)], ["query"]),
    get_vaults: IDL.Func([], [IDL.Vec(Vault)], ["query"]),
    get_vaults_by_address: IDL.Func([IDL.Text], [IDL.Vec(Vault)], ["query"]),
    get_wallets: IDL.Func([IDL.Nat64], [IDL.Vec(Wallet)], ["query"]),
    register_policy: IDL.Func([PolicyRegisterRequest], [Policy], []),
    register_transaction: IDL.Func(
      [TransactionRegisterRequest],
      [Transaction],
      [],
    ),
    register_vault: IDL.Func([VaultRegisterRequest], [Vault], []),
    register_wallet: IDL.Func([WalletRegisterRequest], [Wallet], []),
    store_member: IDL.Func([VaultMemberRequest], [Vault], []),
    update_policy: IDL.Func([Policy], [Policy], []),
    update_vault: IDL.Func([Vault], [Vault], []),
    update_wallet: IDL.Func([Wallet], [Wallet], []),
  })
}
export const init = ({ IDL }: any) => {
  const Conf = IDL.Record({ ledger_canister_id: IDL.Principal })
  return [IDL.Opt(Conf)]
}

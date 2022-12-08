export const idlFactory = ({ IDL }: any) => {
  const Conf = IDL.Record({ 'ledger_canister_id' : IDL.Principal });
  const VaultRole = IDL.Variant({ 'Member' : IDL.Null, 'Admin' : IDL.Null });
  const VaultMemberRequest = IDL.Record({
    'name' : IDL.Opt(IDL.Text),
    'role' : VaultRole,
    'vault_id' : IDL.Nat64,
    'address' : IDL.Text,
  });
  const VaultMember = IDL.Record({
    'user_uuid' : IDL.Text,
    'name' : IDL.Opt(IDL.Text),
    'role' : VaultRole,
  });
  const Vault = IDL.Record({
    'id' : IDL.Nat64,
    'members' : IDL.Vec(VaultMember),
    'name' : IDL.Text,
    'wallets' : IDL.Vec(IDL.Nat64),
    'policies' : IDL.Vec(IDL.Nat64),
  });
  const State = IDL.Variant({
    'REJECTED' : IDL.Null,
    'PENDING' : IDL.Null,
    'APPROVED' : IDL.Null,
  });
  const TransactionApproveRequest = IDL.Record({
    'transaction_id' : IDL.Nat64,
    'state' : State,
  });
  const Approve = IDL.Record({
    'status' : State,
    'signer' : IDL.Text,
    'created_date' : IDL.Nat64,
  });
  const Currency = IDL.Variant({ 'ICP' : IDL.Null });
  const Transaction = IDL.Record({
    'id' : IDL.Nat64,
    'to' : IDL.Text,
    'member_threshold' : IDL.Nat8,
    'block_index' : IDL.Opt(IDL.Nat64),
    'modified_date' : IDL.Nat64,
    'vault_id' : IDL.Nat64,
    'amount_threshold' : IDL.Nat64,
    'state' : State,
    'approves' : IDL.Vec(Approve),
    'currency' : Currency,
    'amount' : IDL.Nat64,
    'created_date' : IDL.Nat64,
    'wallet_id' : IDL.Nat64,
    'policy_id' : IDL.Nat64,
  });
  const ThresholdPolicy = IDL.Record({
    'member_threshold' : IDL.Nat8,
    'amount_threshold' : IDL.Nat64,
    'wallet_ids' : IDL.Opt(IDL.Vec(IDL.Nat64)),
    'currency' : Currency,
  });
  const PolicyType = IDL.Variant({ 'threshold_policy' : ThresholdPolicy });
  const Policy = IDL.Record({ 'id' : IDL.Nat64, 'policy_type' : PolicyType });
  const Wallet = IDL.Record({
    'id' : IDL.Nat64,
    'name' : IDL.Opt(IDL.Text),
    'vaults' : IDL.Vec(IDL.Nat64),
  });
  const PolicyRegisterRequest = IDL.Record({
    'vault_id' : IDL.Nat64,
    'policy_type' : PolicyType,
  });
  const TransactionRegisterRequest = IDL.Record({
    'address' : IDL.Text,
    'amount' : IDL.Nat64,
    'wallet_id' : IDL.Nat64,
  });
  const VaultRegisterRequest = IDL.Record({ 'name' : IDL.Text });
  const WalletRegisterRequest = IDL.Record({
    'name' : IDL.Opt(IDL.Text),
    'vault_id' : IDL.Nat64,
  });
  return IDL.Service({
    'add_vault_member' : IDL.Func([VaultMemberRequest], [Vault], []),
    'approve_transaction' : IDL.Func(
      [TransactionApproveRequest],
      [Transaction],
      [],
    ),
    'get_policies' : IDL.Func([IDL.Nat64], [IDL.Vec(Policy)], ['query']),
    'get_transactions' : IDL.Func([], [IDL.Vec(Transaction)], ['query']),
    'get_vault_members' : IDL.Func(
      [IDL.Nat64],
      [IDL.Vec(VaultMember)],
      ['query'],
    ),
    'get_vaults' : IDL.Func([], [IDL.Vec(Vault)], ['query']),
    'get_wallets' : IDL.Func([IDL.Nat64], [IDL.Vec(Wallet)], ['query']),
    'register_policy' : IDL.Func([PolicyRegisterRequest], [Policy], []),
    'register_transaction' : IDL.Func(
      [TransactionRegisterRequest],
      [Transaction],
      [],
    ),
    'register_vault' : IDL.Func([VaultRegisterRequest], [Vault], []),
    'register_wallet' : IDL.Func([WalletRegisterRequest], [Wallet], []),
    'sub' : IDL.Func([IDL.Nat64], [IDL.Text], ['query']),
    'sub_bytes' : IDL.Func([IDL.Nat64], [IDL.Vec(IDL.Nat8)], ['query']),
    'sub_vec' : IDL.Func([IDL.Nat64], [IDL.Vec(IDL.Nat8)], ['query']),
  });
};
export const init = ({ IDL }: any) => {
  const Conf = IDL.Record({ 'ledger_canister_id' : IDL.Principal });
  return [IDL.Opt(Conf)];
};

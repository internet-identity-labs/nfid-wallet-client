export const idlFactory = ({ IDL }: any) => {
  const Conf = IDL.Record({ "ledger_canister_id": IDL.Principal })
  const VaultRole = IDL.Variant({ "Member": IDL.Null, "Admin": IDL.Null })
  const VaultMemberRequest = IDL.Record({
    "name": IDL.Opt(IDL.Text),
    "role": VaultRole,
    "vault_id": IDL.Nat64,
    "address": IDL.Text,
  })
  const VaultMember = IDL.Record({
    "user_uuid": IDL.Text,
    "name": IDL.Opt(IDL.Text),
    "role": VaultRole,
  })
  const Vault = IDL.Record({
    "id": IDL.Nat64,
    "members": IDL.Vec(VaultMember),
    "name": IDL.Text,
    "wallets": IDL.Vec(IDL.Nat64),
    "policies": IDL.Vec(IDL.Nat64),
  })
  const Wallet = IDL.Record({
    "id": IDL.Nat64,
    "vaults": IDL.Vec(IDL.Nat64),
    "name": IDL.Opt(IDL.Text),
  })
  const VaultRegisterRequest = IDL.Record({ "name": IDL.Text })
  const WalletRegisterRequest = IDL.Record({
    "name": IDL.Opt(IDL.Text),
    "vault_id": IDL.Nat64,
  })
  return IDL.Service({
    "add_vault_member": IDL.Func([VaultMemberRequest], [Vault], []),
    "get_vault_members": IDL.Func(
      [IDL.Nat64],
      [IDL.Vec(VaultMember)],
      ["query"],
    ),
    "get_vaults": IDL.Func([], [IDL.Vec(Vault)], ["query"]),
    "get_wallets": IDL.Func([IDL.Nat64], [IDL.Vec(Wallet)], ["query"]),
    "register_vault": IDL.Func([VaultRegisterRequest], [Vault], []),
    "register_wallet": IDL.Func([WalletRegisterRequest], [Wallet], []),
    "sub": IDL.Func([IDL.Nat64], [IDL.Text], ["query"]),
  })
}
export const init = ({ IDL }: any) => {
  const Conf = IDL.Record({ "ledger_canister_id": IDL.Principal })
  return [IDL.Opt(Conf)]
}

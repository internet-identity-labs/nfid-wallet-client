import type { Principal } from "@dfinity/principal"
import type { ActorMethod } from "@dfinity/agent"

export interface Conf {
  "ledger_canister_id": Principal
}

export interface Vault {
  "id": bigint,
  "members": Array<VaultMember>,
  "name": string,
  "wallets": Array<bigint>,
  "policies": Array<bigint>,
}

export interface VaultMember {
  "user_uuid": string,
  "name": [] | [string],
  "role": VaultRole,
}

export interface VaultMemberRequest {
  "name": [] | [string],
  "role": VaultRole,
  "vault_id": bigint,
  "address": string,
}

export interface VaultRegisterRequest {
  "name": string
}

export type VaultRole = { "Member": null } |
  { "Admin": null };

export interface Wallet {
  "id": bigint,
  "vaults": Array<bigint>,
  "name": [] | [string],
}

export interface WalletRegisterRequest {
  "name": [] | [string],
  "vault_id": bigint,
}

export interface _SERVICE {
  "add_vault_member": ActorMethod<[VaultMemberRequest], Vault>,
  "get_vault_members": ActorMethod<[bigint], Array<VaultMember>>,
  "get_vaults": ActorMethod<[], Array<Vault>>,
  "get_wallets": ActorMethod<[bigint], Array<Wallet>>,
  "register_vault": ActorMethod<[VaultRegisterRequest], Vault>,
  "register_wallet": ActorMethod<[WalletRegisterRequest], Wallet>,
  "sub": ActorMethod<[bigint], string>,
}

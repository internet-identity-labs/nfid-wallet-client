import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface Conf {
  ledger_canister_id: Principal
}
export interface Vault {
  id: bigint
  members: Array<VaultMember>
  name: string
  wallets: Array<bigint>
  policies: Array<bigint>
}
export interface VaultMember {
  user_uuid: string
  name: [] | [string]
  role: VaultRole
}
export type VaultRole = { VaultOwner: null } | { VaultApprove: null }
export interface Wallet {
  id: bigint
  vault_ids: Array<bigint>
  name: [] | [string]
}
export interface _SERVICE {
  add_vault_member: ActorMethod<
    [bigint, string, [] | [string], VaultRole],
    Vault
  >
  get_vault_members: ActorMethod<[bigint], Array<VaultMember>>
  get_vaults: ActorMethod<[], Array<Vault>>
  register_vault: ActorMethod<[string], Vault>
  register_wallet: ActorMethod<[bigint, [] | [string]], Wallet>
  sub: ActorMethod<[bigint], string>
}

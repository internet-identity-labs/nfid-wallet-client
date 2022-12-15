import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface Approve {
  status: TransactionState
  signer: string
  created_date: bigint
}
export interface Conf {
  ledger_canister_id: Principal
}
export type Currency = { ICP: null }
export type ObjectState = { Active: null } | { Archived: null }
export interface Policy {
  id: bigint
  vault: bigint
  modified_date: bigint
  state: ObjectState
  policy_type: PolicyType
  created_date: bigint
}
export interface PolicyRegisterRequest {
  vault_id: bigint
  policy_type: PolicyType
}
export type PolicyType = { threshold_policy: ThresholdPolicy }
export interface ThresholdPolicy {
  member_threshold: number
  amount_threshold: bigint
  wallet_ids: [] | [Array<bigint>]
  currency: Currency
}
export interface Transaction {
  id: bigint
  to: string
  member_threshold: number
  block_index: [] | [bigint]
  owner: string
  modified_date: bigint
  vault_id: bigint
  amount_threshold: bigint
  state: TransactionState
  approves: Array<Approve>
  currency: Currency
  amount: bigint
  created_date: bigint
  wallet_id: bigint
  policy_id: bigint
}
export interface TransactionApproveRequest {
  transaction_id: bigint
  state: TransactionState
}
export interface TransactionRegisterRequest {
  address: string
  amount: bigint
  wallet_id: bigint
}
export type TransactionState =
  | { Approved: null }
  | { Rejected: null }
  | { Canceled: null }
  | { Pending: null }
export interface Vault {
  id: bigint
  members: Array<VaultMember>
  modified_date: bigint
  name: string
  description: [] | [string]
  state: ObjectState
  wallets: Array<bigint>
  created_date: bigint
  policies: Array<bigint>
}
export interface VaultMember {
  user_uuid: string
  name: [] | [string]
  role: VaultRole
  state: ObjectState
}
export interface VaultMemberRequest {
  name: [] | [string]
  role: VaultRole
  vault_id: bigint
  state: ObjectState
  address: string
}
export interface VaultRegisterRequest {
  name: string
  description: [] | [string]
}
export type VaultRole = { Member: null } | { Admin: null }
export interface Wallet {
  id: bigint
  modified_date: bigint
  name: [] | [string]
  vaults: Array<bigint>
  state: ObjectState
  created_date: bigint
}
export interface WalletRegisterRequest {
  name: [] | [string]
  vault_id: bigint
}
export interface _SERVICE {
  approve_transaction: ActorMethod<[TransactionApproveRequest], Transaction>
  get_policies: ActorMethod<[bigint], Array<Policy>>
  get_transactions: ActorMethod<[], Array<Transaction>>
  get_vaults: ActorMethod<[], Array<Vault>>
  get_wallets: ActorMethod<[bigint], Array<Wallet>>
  register_policy: ActorMethod<[PolicyRegisterRequest], Policy>
  register_transaction: ActorMethod<[TransactionRegisterRequest], Transaction>
  register_vault: ActorMethod<[VaultRegisterRequest], Vault>
  register_wallet: ActorMethod<[WalletRegisterRequest], Wallet>
  store_member: ActorMethod<[VaultMemberRequest], Vault>
  sub: ActorMethod<[bigint], string>
  update_policy: ActorMethod<[Policy], Policy>
  update_vault: ActorMethod<[Vault], Vault>
  update_wallet: ActorMethod<[Wallet], Wallet>
}

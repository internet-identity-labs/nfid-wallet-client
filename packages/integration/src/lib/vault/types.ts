import { Currency as CurrencyTransport } from "../_ic_api/vault.d"

export interface Vault {
  id: bigint
  members: Array<VaultMember>
  name: string
  wallets: Array<bigint>
  policies: Array<bigint>
}

export interface Wallet {
  id: bigint
  name: string | undefined
  vaults: Array<bigint>
}

export interface VaultMember {
  userId: string
  name: string | undefined
  role: VaultRole
}

export enum VaultRole {
  Admin,
  Member,
}

export enum PolicyType {
  ThresholdPolicy = "ThresholdPolicy",
}

export enum Currency {
  ICP,
}

export interface BasePolicy {
  id: bigint
  type: PolicyType
}

export interface ThresholdPolicy extends BasePolicy {
  memberThreshold: number
  amountThreshold: bigint
  walletIds?: Array<bigint>
  currency: Currency
}

export type Policy = ThresholdPolicy // | AddressPolicy

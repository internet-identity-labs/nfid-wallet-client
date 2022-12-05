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
  ThresholdPolicy,
}

export enum Currency {
  ICP
}

export interface Policy {
  "id": bigint,
  "type": PolicyType,
}

export interface ThresholdPolicy extends Policy {
  "id": bigint,
  "type": PolicyType,
  "memberThreshold": number,
  "amountThreshold": bigint,
  "walletIds": undefined | [Array<bigint>],
  "currency": Currency,
}

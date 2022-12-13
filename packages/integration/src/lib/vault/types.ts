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

export enum State {
  APPROVED,
  PENDING,
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

export interface Approve {
  status: State
  signer: string
  createdDate: bigint
}

export interface Transaction {
  id: bigint
  to: string
  memberThreshold: number
  blockIndex: bigint | undefined
  amountThreshold: bigint
  state: State
  approves: Array<Approve>
  currency: Currency
  amount: bigint
  createdDate: bigint
  modifiedDate: bigint
  walletId: bigint
  vaultId: bigint
  policyId: bigint
}

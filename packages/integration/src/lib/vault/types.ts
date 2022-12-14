export interface Vault {
  id: bigint
  members: Array<VaultMember>
  name: string
  description: string | undefined
  wallets: Array<bigint>
  policies: Array<bigint>
  createdDate: bigint
  modifiedDate: bigint
}

export interface Wallet {
  id: bigint
  name: string | undefined
  vaults: Array<bigint>
  state: ObjectState
  cratedDate: bigint
  modifiedDate: bigint
}

export interface VaultMember {
  userId: string
  name: string | undefined
  role: VaultRole
  state: ObjectState
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

export enum TransactionState {
  APPROVED,
  PENDING,
  CANCELED,
  REJECTED
}

export enum ObjectState {
  ARCHIVED,
  ACTIVE,
}

export interface BasePolicy {
  id: bigint
  type: PolicyType
  vault: bigint
  state: ObjectState
  createdDate: bigint
  modifiedDate: bigint
}

export interface ThresholdPolicy extends BasePolicy {
  memberThreshold: number
  amountThreshold: bigint
  walletIds?: Array<bigint>
  currency: Currency
}

export type Policy = ThresholdPolicy // | AddressPolicy

export interface Approve {
  status: TransactionState
  signer: string
  createdDate: bigint
}

export interface Transaction {
  id: bigint
  to: string
  memberThreshold: number
  blockIndex: bigint | undefined
  amountThreshold: bigint
  state: TransactionState
  approves: Array<Approve>
  currency: Currency
  amount: bigint
  createdDate: bigint
  modifiedDate: bigint
  walletId: bigint
  vaultId: bigint
  policyId: bigint
  owner: string
}

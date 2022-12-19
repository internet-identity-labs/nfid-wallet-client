export interface Vault {
  id: bigint
  members: Array<VaultMember>
  name: string
  description: string | undefined
  wallets: Array<string>
  policies: Array<bigint>
  createdDate: bigint
  modifiedDate: bigint
}

export interface Wallet {
  uid: string
  name: string | undefined
  vaults: Array<bigint>
  state: ObjectState
  createdDate: bigint
  modifiedDate: bigint
}

export interface VaultMember {
  userId: string
  name: string | undefined
  role: VaultRole
  state: ObjectState
}

export enum VaultRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum PolicyType {
  THRESHOLD_POLICY = "THRESHOLD_POLICY",
}

export enum Currency {
  ICP = "ICP",
}

export enum TransactionState {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  CANCELED = "CANCELED",
  REJECTED = "REJECTED",
}

export enum ObjectState {
  ARCHIVED = "ARCHIVED",
  ACTIVE = "ACTIVE",
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
  wallets?: Array<string>
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
  from_sub_account: string
  vaultId: bigint
  policyId: bigint
  owner: string
}

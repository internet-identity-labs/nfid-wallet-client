export interface Vault {
  id: bigint
  members: Array<VaultMember>
  name: string
  wallets: Array<bigint>
  policies: Array<bigint>
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

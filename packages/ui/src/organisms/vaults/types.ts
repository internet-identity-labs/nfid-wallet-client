import { StoredVault, VaultCreationPrice } from "@nfid/integration"
import { Principal } from "@dfinity/principal"
import { Transaction, TransactionType, Vault, VaultMember } from "@nfid/vaults"
import { KeyedMutator } from "swr"
import { FT } from "frontend/integration/ft/ft"

export interface VaultsProps {
  vaults: StoredVault[] | undefined
  isLoading: boolean
  createVault: (name: string) => Promise<void>
  getPrice: () => Promise<VaultCreationPrice | undefined>
  links: {
    vaults: string
  }
}

export type CreateVaultModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  price: VaultCreationPriceFormatted | undefined
  priceLoading: boolean
}

export interface VaultDetailstProps {
  address: string | undefined
  vault:
    | {
        state: Vault
        transactions: Transaction[]
      }
    | undefined
  refreshPortfolio: KeyedMutator<{
    state: Vault
    transactions: Transaction[]
  }>
  isLoading: boolean
  isUsdLoading: boolean
  usdBalance:
    | {
        value: string
        dayChange?: string
        dayChangePercent?: string
        dayChangePositive?: boolean
      }
    | undefined
}

export interface VaultPolicyProps {
  validateAddress: (address?: string) => (address: string) => boolean | string
  addMember: (
    owner: Principal,
    name: string,
    subaccount?: Uint8Array | number[],
  ) => Promise<void>
  updateQuorum: (quorum: number) => Promise<void>
  updateMember: (memberId: string, name: string) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  isLoading: boolean
  vault:
    | {
        state: Vault
        transactions: Transaction[]
      }
    | undefined
}

export type UpdayePolicyModalProps = {
  isOpen: boolean
  onClose: () => void
  type: PolicyUpdateType | null
  setType: (v: PolicyUpdateType | null) => void
  validateAddress: (address?: string) => (address: string) => boolean | string
  addMember: (
    owner: Principal,
    name: string,
    subaccount?: Uint8Array | number[],
  ) => Promise<void>
  updateQuorum: (quorum: number) => Promise<void>
  updateMember: (memberId: string, name: string) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  selectedMember?: VaultMember
  approversQuantity: number | undefined
  setApproversQuantity: (v: number) => void
  membersQuantity: number
}

export interface VaultPortfolioProps {
  tokens: FT[] | undefined
  allTokens: FT[]
  isLoading: boolean
  isTokensLoading: boolean
  isUsdLoading: boolean
  usdBalance:
    | {
        value: string
        dayChange?: string
        dayChangePercent?: string
        dayChangePositive?: boolean
      }
    | undefined
  vault: Vault | undefined
  updateVault: KeyedMutator<{
    state: Vault
    transactions: Transaction[]
  }>
}

export type VaultCreationPriceFormatted = {
  icpPrice: string
  cyclePrice: string
}

export type CreateVaultFormValues = {
  vaultName: string
}

export type UpdatePolicyFormValues = {
  approverName: string
  approverAddress: string
}

export enum CreateVaultStep {
  PREPARE = "PREPARE",
  PAY = "PAY",
}

export enum PolicyUpdateType {
  THRESHOLD = "THRESHOLD",
  ADD_APPROVER = "ADD_APPROVER",
  EDIT_APPROVER = "EDIT_APPROVER",
  REMOVE_APPROVER = "REMOVE_APPROVER",
}

export interface IVaultRow {
  id: string
  action: TransactionType
  timestamp: Date
  from: string
  to: string
}

export interface IVaultRowGroup {
  date: string
  rows: IVaultRow[]
}

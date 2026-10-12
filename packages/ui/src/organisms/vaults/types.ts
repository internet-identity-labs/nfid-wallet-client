/* eslint-disable @nx/enforce-module-boundaries */
import { StoredVault, VaultCreationPrice } from "@nfid/integration"
import { Principal } from "@dfinity/principal"
import { Transaction, Vault, VaultMember } from "@nfid/vaults"
export type { VaultMember }
import { KeyedMutator } from "swr"
import { FT } from "frontend/integration/ft/ft"
import { SelectedToken } from "frontend/features/transfer-modal/types"

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

export interface VaultDetailsProps {
  vaultId: string | undefined
  tokens?: FT[]
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
  onSendClick: () => void
  onReceiveClick: () => void
  isLowCyclesBalance: boolean
  xdrPermyriadPerIcp: bigint | undefined
  topUp: (amount: string) => Promise<void>
  vaultIcpBalance: number | undefined
  deposits?: VaultDeposit[]
  approve?: (txIds: string[]) => Promise<void>
  reject?: (txIds: string[]) => Promise<void>
}

export interface VaultTransactionsProps {
  vaultId: string | undefined
  tokens?: FT[]
  vault:
    | {
        state: Vault
        transactions: Transaction[]
      }
    | undefined
  isLoading: boolean
  xdrPermyriadPerIcp?: bigint
  deposits?: VaultDeposit[]
}

export interface VaultSidePanelProps {
  isOpen: boolean
  onClose: () => void
  txGroup: Transaction[] | null
  deposit?: VaultDeposit | null
  vaultId: string | undefined
  tokens: FT[] | undefined
  members?: VaultMember[]
  xdrPermyriadPerIcp?: bigint
  quorum?: number
  approve?: (txIds: string[]) => Promise<void>
  reject?: (txIds: string[]) => Promise<void>
  allTransactions?: Transaction[]
}

export interface VaultPolicyProps {
  validateAddress: (address?: string) => (address: string) => boolean | string
  addMember: (
    owner: Principal,
    name: string,
    subaccount?: Uint8Array | number[],
    newQuorum?: number,
  ) => Promise<void>
  updateQuorum: (quorum: number) => Promise<void>
  updateMember: (memberId: string, name: string) => Promise<void>
  removeMember: (memberId: string, newQuorum?: number) => Promise<void>
  isLoading: boolean
  vault:
    | {
        state: Vault
        transactions: Transaction[]
      }
    | undefined
}

export type UpdatePolicyModalProps = {
  isOpen: boolean
  onClose: () => void
  type: PolicyUpdateType | null
  setType: (v: PolicyUpdateType | null) => void
  validateAddress: (address?: string) => (address: string) => boolean | string
  addMember: (
    owner: Principal,
    name: string,
    subaccount?: Uint8Array | number[],
    newQuorum?: number,
  ) => Promise<void>
  updateQuorum: (quorum: number) => Promise<void>
  updateMember: (memberId: string, name: string) => Promise<void>
  removeMember: (memberId: string, newQuorum?: number) => Promise<void>
  selectedMember?: VaultMember
  approversCurrentQuantity: number
  approversQuantity: number | undefined
  setApproversQuantity: (v: number) => void
  membersQuantity: number
}

export type ControllersModalProps = {
  isOpen: boolean
  onClose: () => void
  validateAddress: (address?: string) => (address: string) => boolean | string
  updateControllers: (controllers: string[]) => Promise<void>
  controllers: string[] | undefined
}

export type TopUpModalProps = {
  isOpen: boolean
  onClose: () => void
  vaultId: string | undefined
  xdrPermyriadPerIcp: bigint | undefined
  topUp: (amount: string) => Promise<void>
  vaultIcpBalance: number | undefined
}

export type PurgeModalProps = {
  isOpen: boolean
  onClose: () => void
  purge: () => Promise<void>
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
  updateVault: () => Promise<void>
  onSendClick: (selectedToken: SelectedToken) => void
}

export interface VaultAdvancedControlsProps {
  updateControllers: (controllers: string[]) => Promise<void>
  validateAddress: (address?: string) => (address: string) => boolean | string
  controllers: string[] | undefined
  isLoading: boolean
  purge: () => Promise<void>
  vaultId: string | undefined
  cyclesBalance: string | undefined
  xdrPermyriadPerIcp: bigint | undefined
  topUp: (amount: string) => Promise<void>
  vaultIcpBalance: number | undefined
}

export interface VaultDeposit {
  id: string
  from: string
  to: string
  amount: number
  canisterId: string
  timestamp: Date
}

export interface VaultTableProps {
  transactions: Transaction[]
  setChosenTransaction: (v: Transaction[] | null) => void
  setChosenDeposit?: (v: VaultDeposit | null) => void
  tableType: VaultTableType
  vaultId?: string
  tokens?: FT[]
  limit?: number
  members?: VaultMember[]
  xdrPermyriadPerIcp?: bigint
  quorum?: number
  deposits?: VaultDeposit[]
  allTransactions?: Transaction[]
}

export interface VaultTableRowProps {
  setChosenTransaction: (v: Transaction[] | null) => void
  txGroup: Transaction[]
  vaultId?: string
  tokens?: FT[]
  members?: VaultMember[]
  xdrPermyriadPerIcp?: bigint
  quorum?: number
  allTransactions?: Transaction[]
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

export type UpdateControllersValues = {
  newController: string
}

export type TopUpAmountValues = {
  topUpAmount: string
}

export type TxItem = { kind: "tx"; group: Transaction[] }

export type DepositItem = { kind: "deposit"; deposit: VaultDeposit }

export type TableItem = TxItem | DepositItem

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

export enum VaultTableType {
  PENDING = "PENDING",
  BLOCKED = "BLOCKED",
  RECENT = "RECENT",
  ALL = "ALL",
}

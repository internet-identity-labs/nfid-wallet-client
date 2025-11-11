import { Principal } from "@dfinity/principal"

import { Category, State, SupportedChain } from "./enum/enums"

export enum IActivityAction {
  SENT = "Sent",
  RECEIVED = "Received",
  SWAP = "Swap",
  MINT = "Mint",
  BURN = "Burn",
  APPROVE = "Approve",
}
export interface ICRC1 {
  logo: string | undefined
  name: string
  ledger: string
  category: Category
  index: string | undefined
  symbol: string
  state: State
  fee: bigint
  decimals: number
  rootCanisterId: string | undefined
}

export class ICRC1Error extends Error {}

export interface ICRC1Data {
  balance: bigint
  name: string
  owner: Principal
  symbol: string
  decimals: number
  fee: bigint
  canisterId: string
  logo: string | undefined
}

export interface ICRC1Metadata {
  name: string
  symbol: string
  logo?: string
  decimals: number
  fee: bigint
}

export interface ICRC1IndexData {
  canisterId?: string | undefined
  transactions: Array<TransactionData>
  // The oldest transaction id (it can help to stop the pagination in the UI)
  oldestTransactionId: bigint | undefined
}

export interface TransactionData {
  type: IActivityAction
  timestamp: bigint
  transactionId: bigint
  symbol?: string
  symbolTo?: string
  amount: bigint
  amountTo?: bigint
  from?: string
  to?: string
  decimals: number
  decimalsTo?: number
  icon?: string
  iconTo?: string
  canister?: string
  canisterTo?: string
}

export interface AllowanceDetailDTO {
  from_account: string
  to_spender: string
  allowance: bigint
  expires_at: bigint | undefined
}

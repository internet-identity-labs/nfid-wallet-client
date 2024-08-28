import {Category, State} from "./enum/enums"
import {Principal} from "@dfinity/principal";

export interface ICRC1 {
  'logo' : string | undefined,
  'name' : string,
  'ledger' : string,
  'category' : Category,
  'index' : string | undefined,
  'symbol' : string,
  state: State
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
  balance: bigint
  canisterId: string
  fee: bigint
  feeInUsd: number | undefined
  rate: number | undefined
  decimals: number
  owner: Principal
  logo: string
  name: string
  symbol: string
  feeCurrency: string
  toPresentation: (
    value?: bigint | undefined,
    decimals?: number,
  ) => number | string
  transformAmount: (value: string) => number
}

export interface ICRC1IndexData {
  canisterId?: string | undefined
  transactions: Array<TransactionData>
  // The oldest transaction id (it can help to stop the pagination in the UI)
  oldestTransactionId: bigint | undefined
}

export interface TransactionData {
  type: "sent" | "received"
  timestamp: bigint
  transactionId: bigint
  symbol: string
  amount: bigint
  from: string
  to: string
  decimals: number
}

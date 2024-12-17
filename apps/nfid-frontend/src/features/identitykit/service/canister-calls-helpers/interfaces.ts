export interface DefaultMetadata {
  balance: number
  address: string
}

export interface ICRC2Metadata {
  symbol: string
  decimals: number
  fee: string
  amount: string
  balance: string
  address: string
}

export interface TransferMetadata {
  toAddress: string
  amount: string
  balance: string
  isInsufficientBalance: boolean
  usdRate?: string
  address: string
  symbol: string
  decimals: number
  fee: string
  total: string
}

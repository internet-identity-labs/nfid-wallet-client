export type OCPNetwork =
  | "Ethereum"
  | "Polygon"
  | "Arbitrum"
  | "Base"
  | "BNB"
  | "Bitcoin"
  | "ICP"

export interface OCPPayRequest {
  tag: "payRequest"
  callback: string
  minSendable: number
  maxSendable: number
  metadata: string
  currencies: OCPCurrency[]
}

export interface OCPCurrency {
  name: string
  network: OCPNetwork
  symbol: string
  decimals: number
  minSendable: number
  maxSendable: number
  convertedMultiplier?: number
}

export interface OCPQuote {
  id: string
  expiresAt: string
  amount: string
  fee: string
  method: OCPNetwork
  asset: string
  targetAddress: string
}

export interface OCPCallbackResponse {
  pr: string
  routes: unknown[]
  quote: OCPQuote
}

export interface OCPSubmitRequest {
  quoteId: string
  method: OCPNetwork
  rawTx: string
  txId: string
}

export interface OCPSubmitResponse {
  status: "ok" | "error"
  message?: string
}

export interface OCPPaymentSummary {
  recipientName: string
  currency: OCPCurrency
  quote: OCPQuote
  networkFee: string
  totalAmount: string
  totalAmountUSD: string
  quoteExpiresIn: number
}

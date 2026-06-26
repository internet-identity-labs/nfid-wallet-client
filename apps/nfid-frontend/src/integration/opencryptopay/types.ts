export type OCPNetwork =
  | "Ethereum"
  | "Polygon"
  | "Arbitrum"
  | "Base"
  | "Bitcoin"
  | "ICP"

export interface OCPPayRequest {
  tag: "payRequest"
  callback: string
  minSendable: number
  maxSendable: number
  metadata: string
  transferAmounts: OCPTransferAmount[]
  quote?: { id: string }
}

export interface OCPTransferAmount {
  method: OCPNetwork
  available: boolean
  minFee: number
  assets: OCPAsset[]
}

export interface OCPAsset {
  asset: string
  amount: string
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
  quoteRef: string
  expiresAt: string
  amount: string
  fee: string
  method: OCPNetwork
  asset: string
  targetAddress: string
  submitUrl: string
  // ERC-20 token contract address. Present when the EVM payment is a token
  // transfer (DFX matches the activation by asset.chainId === tx.to). Absent for
  // native coin payments.
  tokenAddress?: string
  // Exact uint256 token amount (raw, in the token's smallest unit) for the ERC-20
  // transfer calldata. DFX validates the decoded transfer amount against this value.
  amountRaw?: string
  // DFX-only: the LNURL pay-request URL and token decimals, kept so the quote can be
  // re-fetched immediately before submit. DFX rotates its actual quote over time and
  // attaches the on-chain activation to whichever quote is current when the transfer
  // URI is requested; re-fetching keeps the activation and the ?quote= id consistent.
  dfxPaymentUrl?: string
  decimals?: number
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

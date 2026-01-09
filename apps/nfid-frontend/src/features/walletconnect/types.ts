export interface EthereumTransactionParams {
  to?: string
  from?: string
  value?: string
  gas?: string | number
  gasLimit?: string | number
  gasPrice?: string | number
  maxFeePerGas?: string | number
  maxPriorityFeePerGas?: string | number
  nonce?: string | number
  data?: string
  chainId?: string | number
}

export interface WalletConnectSignRequestProps {
  dAppOrigin: string
  isLoading?: boolean
  onSign: () => Promise<void>
  onCancel: () => void
  error?: string | null
}

export type ValidationStatus = "VALID" | "UNKNOWN" | "INVALID"

export interface VerifyContext {
  verified: {
    origin: string
    validation: ValidationStatus
    isScam?: boolean
  }
}

export interface WCGasData {
  gasUsed: bigint
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  baseFeePerGas: bigint
  total: bigint
}

/**
 * Ethereum transaction parameters as received from WalletConnect
 */
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

/**
 * Common props for all WalletConnect sign request components
 */
export interface WalletConnectSignRequestProps {
  dAppOrigin: string
  isLoading?: boolean
  onSign: () => void
  onCancel: () => void
  error?: string | null
}

/**
 * Format value from wei to readable format
 */
export const formatValue = (value?: string): string => {
  if (!value || value === "0x" || value === "0x0" || value === "0") {
    return "0 ETH"
  }
  try {
    const wei = BigInt(value.startsWith("0x") ? value : `0x${value}`)
    const eth = Number(wei) / 1e18
    return `${eth.toFixed(6)} ETH`
  } catch {
    return value
  }
}

/**
 * Format gas price from wei to Gwei
 */
export const formatGasPrice = (gasPrice?: string | number): string => {
  if (!gasPrice) return "N/A"
  try {
    const price =
      typeof gasPrice === "string" ? BigInt(gasPrice) : BigInt(gasPrice)
    const gwei = Number(price) / 1e9
    return `${gwei.toFixed(2)} Gwei`
  } catch {
    return String(gasPrice)
  }
}

/**
 * Get dApp hostname from origin URL
 */
export const getDAppHostname = (origin: string): string => {
  try {
    if (origin) {
      return new URL(origin).hostname
    }
  } catch {
    return origin || "Unknown"
  }
  return "Unknown"
}

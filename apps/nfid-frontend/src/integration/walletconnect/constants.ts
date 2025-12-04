/**
 * WalletConnect constants
 */

// Project ID from cloud.walletconnect.com
export const WALLETCONNECT_PROJECT_ID = "951ec7b9914a35c2f62e2514c408ab8f"

// Wallet metadata for WalletConnect
export const WALLETCONNECT_METADATA = {
  name: "NFID Wallet",
  description: "NFID Wallet - simple and secure wallet for Internet Computer",
  url: "https://nfid.one",
  icons: ["https://nfid.one/assets/nfid-wallet-og.png"],
}

// Supported Ethereum methods
export const ETH_METHODS = [
  "eth_sendTransaction",
  "eth_signTransaction",
  "eth_sign",
  "personal_sign",
  "eth_signTypedData",
  "eth_signTypedData_v4",
] as const

// Supported events
export const ETH_EVENTS = ["chainChanged", "accountsChanged"] as const

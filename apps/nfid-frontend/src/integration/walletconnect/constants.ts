/**
 * WalletConnect constants
 */

// Project ID from cloud.walletconnect.com
export const WALLETCONNECT_PROJECT_ID = "a88bf3d112c5af8cecb8dc17ef373114"

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
export const ETH_EVENTS = [
  "chainChanged",
  "accountsChanged",
  "message",
  "disconnect",
  "connect",
] as const

export const NAMESPACES = {
  eip155: {
    chains: [
      "eip155:1",
      "eip155:137",
      "eip155:56",
      "eip155:8453",
      "eip155:42161",
      "eip155:11155111",
    ],
    methods: ETH_METHODS,
    events: ETH_EVENTS,
  },
}

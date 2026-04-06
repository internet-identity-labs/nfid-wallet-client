/**
 * WalletConnect constants
 */

// Project ID from cloud.walletconnect.com
export const WALLETCONNECT_PROJECT_ID = "a88bf3d112c5af8cecb8dc17ef373114"

// Wallet metadata for WalletConnect (url/icons must match the page origin — see getWalletConnectMetadata)
const WALLETCONNECT_METADATA_BASE = {
  name: "NFID Wallet",
  description: "NFID Wallet - simple and secure wallet for Internet Computer",
} as const

/**
 * Wallet metadata URL comes from `NFID_PROVIDER_URL` in `.env.{local,dev,ic,...}` (webpack `config/webpack-env`).
 * WalletConnect expects `metadata.url` to match `window.location.origin`, so open the app at the same origin
 * as in env (e.g. `http://localhost:9090` for local — avoid mixing `localhost` vs `127.0.0.1`).
 */
export function getWalletConnectMetadata() {
  const origin = NFID_PROVIDER_URL.replace(/\/$/, "")
  return {
    ...WALLETCONNECT_METADATA_BASE,
    url: origin,
    icons: [`${origin}/assets/nfid-wallet-og.png`],
  }
}

// Supported Ethereum methods
export const ETH_METHODS = [
  "eth_sendTransaction",
  "eth_signTransaction",
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
      "eip155:8453",
      "eip155:42161",
      "eip155:11155111",
    ],
    methods: ETH_METHODS,
    events: ETH_EVENTS,
  },
}

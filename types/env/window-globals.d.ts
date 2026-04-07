declare global {
  interface Window {
    chrome?: unknown
    opr?: unknown
    walletConnectService?: unknown
  }

  interface Navigator {
    brave?: {
      isBrave?: () => Promise<boolean>
    }
  }

  interface BigInt {
    toJSON?: () => string
  }
}

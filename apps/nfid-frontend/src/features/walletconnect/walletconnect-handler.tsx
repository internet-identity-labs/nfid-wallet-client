import React, { useEffect } from "react"

import { walletConnectService } from "frontend/integration/walletconnect"

/**
 * WalletConnect Handler Component
 *
 * Handles URI-based connections from URL parameters (for local testing or deep links).
 * Event handling is done by WalletConnectModal.
 */
export const WalletConnectHandler: React.FC = () => {
  useEffect(() => {
    // Listen for URI in URL (for local testing or deep links)
    const urlParams = new URLSearchParams(window.location.search)
    const wcUri = urlParams.get("wc")
    if (wcUri) {
      const fullUri = `wc:${wcUri}`
      walletConnectService.connectViaUri(fullUri).catch((error) => {
        console.debug("Failed to connect via URI:", error)
      })
    }
  }, [])

  return null // No UI, just handles URI connections
}

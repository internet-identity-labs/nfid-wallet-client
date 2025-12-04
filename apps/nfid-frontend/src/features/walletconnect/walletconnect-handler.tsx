import React, { useEffect } from "react"
import { SignClientTypes } from "@walletconnect/types"

import { walletConnectService } from "frontend/integration/walletconnect"

/**
 * WalletConnect Handler Component
 *
 * This component listens for WalletConnect events and opens /rpc/walletconnect/
 * for connection requests and signing requests.
 */
export const WalletConnectHandler: React.FC = () => {
  useEffect(() => {
    // Listen for session proposal events
    // Modal will handle displaying the proposal
    const handleProposal = (event: CustomEvent) => {
      console.log(
        "WalletConnectHandler: Proposal received, modal will handle it",
      )
    }

    // Listen for session request events
    const handleRequest = (event: CustomEvent) => {
      console.log("WalletConnectHandler: Request received", event.detail)
      console.log("WalletConnectHandler: Event type:", event.type)
      console.log("WalletConnectHandler: Event detail:", event.detail)

      const request =
        event.detail as SignClientTypes.EventArguments["session_request"]

      if (!request) {
        console.error("WalletConnectHandler: Request is null or undefined")
        return
      }

      console.log("WalletConnectHandler: Request ID:", request.id)
      console.log("WalletConnectHandler: Request topic:", request.topic)
      console.log(
        "WalletConnectHandler: Request method:",
        request.params.request.method,
      )

      // Get dApp origin from session
      const sessions = walletConnectService.getActiveSessions()
      console.log(
        "WalletConnectHandler: Active sessions count:",
        sessions.length,
      )
      console.log(
        "WalletConnectHandler: Active session topics:",
        sessions.map((s) => s.topic),
      )

      const session = sessions.find((s) => s.topic === request.topic)
      if (!session) {
        console.error(
          "WalletConnectHandler: No session found for topic:",
          request.topic,
        )
        console.error(
          "WalletConnectHandler: Available topics:",
          sessions.map((s) => s.topic),
        )
      } else {
        console.log(
          "WalletConnectHandler: Found session for topic:",
          session.topic,
        )
      }

      // Just emit the event - modal will handle it
      console.log(
        "WalletConnectHandler: Request event emitted, modal will handle it",
      )
    }

    // Check for pending proposal on mount
    // Modal will handle displaying it
    const pendingProposal = walletConnectService.getPendingProposal()
    if (pendingProposal) {
      console.log(
        "WalletConnectHandler: Found pending proposal on mount, modal will handle it",
      )
    } else {
      console.log("WalletConnectHandler: No pending proposal on mount")
    }

    window.addEventListener(
      "walletconnect:proposal",
      handleProposal as EventListener,
    )
    window.addEventListener(
      "walletconnect:request",
      handleRequest as EventListener,
    )

    // Listen for URI in URL (for local testing)
    const urlParams = new URLSearchParams(window.location.search)
    const wcUri = urlParams.get("wc")
    if (wcUri) {
      const fullUri = `wc:${wcUri}`
      walletConnectService.connectViaUri(fullUri).catch((error) => {
        console.error("Failed to connect via URI:", error)
      })
    }

    return () => {
      window.removeEventListener(
        "walletconnect:proposal",
        handleProposal as EventListener,
      )
      window.removeEventListener(
        "walletconnect:request",
        handleRequest as EventListener,
      )
    }
  }, [])

  return null // No UI, just handles events
}

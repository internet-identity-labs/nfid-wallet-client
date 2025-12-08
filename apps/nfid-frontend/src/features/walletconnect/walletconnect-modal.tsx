import React, { useState, useEffect, useCallback } from "react"
import { SignClientTypes } from "@walletconnect/types"

import { ModalAdvanced } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"
import { walletConnectService } from "frontend/integration/walletconnect"
import { WalletConnectRequest } from "./components/walletconnect-request"
import { WalletConnectProposal } from "./components/walletconnect-proposal"
/**
 * WalletConnect Modal Component
 *
 * Displays WalletConnect requests in a modal dialog instead of opening a new window.
 */
export const WalletConnectModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [request, setRequest] = useState<
    SignClientTypes.EventArguments["session_request"] | null
  >(null)
  const [proposal, setProposal] = useState<
    SignClientTypes.EventArguments["session_proposal"] | null
  >(null)
  const [ethAddress, setEthAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEthAddress = useCallback(async () => {
    try {
      setIsLoadingAddress(true)
      const { delegationIdentity } = authState.get()
      if (delegationIdentity) {
        const address = await walletConnectService.getEthereumAddress()
        setEthAddress(address)
      }
    } catch (err) {
      console.debug("Failed to get Ethereum address:", err)
    } finally {
      setIsLoadingAddress(false)
    }
  }, [])

  useEffect(() => {
    loadEthAddress()
  }, [loadEthAddress])

  useEffect(() => {
    // Listen for session request events
    const handleRequest = (event: CustomEvent) => {
      console.log("WalletConnectModal: Request received", event.detail)
      const request =
        event.detail as SignClientTypes.EventArguments["session_request"]
      if (request) {
        setRequest(request)
        setProposal(null)
        setError(null)
        setIsLoading(false)
        setIsOpen(true)
      }
    }

    // Listen for session proposal events
    const handleProposal = (event: CustomEvent) => {
      console.log("WalletConnectModal: Proposal received", event.detail)
      const proposal =
        event.detail as SignClientTypes.EventArguments["session_proposal"]
      if (proposal) {
        setProposal(proposal)
        setRequest(null)
        setError(null)
        setIsLoading(false)
        setIsOpen(true)
        loadEthAddress()
      }
    }

    window.addEventListener(
      "walletconnect:request",
      handleRequest as EventListener,
    )
    window.addEventListener(
      "walletconnect:proposal",
      handleProposal as EventListener,
    )

    // Check for pending proposal on mount
    const pendingProposal = walletConnectService.getPendingProposal()
    if (pendingProposal) {
      setProposal(pendingProposal)
      setRequest(null)
      setError(null)
      setIsLoading(false)
      setIsOpen(true)
      loadEthAddress()
    }

    return () => {
      window.removeEventListener(
        "walletconnect:request",
        handleRequest as EventListener,
      )
      window.removeEventListener(
        "walletconnect:proposal",
        handleProposal as EventListener,
      )
    }
  }, [loadEthAddress])

  const handleClose = () => {
    setIsOpen(false)
    setRequest(null)
    setProposal(null)
    setError(null)
    setIsLoading(false)
  }

  const handleProposalApprove = async () => {
    if (!proposal || !ethAddress) {
      setError("Please login to your wallet first")
      return
    }

    try {
      setIsLoading(true)
      const accounts = [ethAddress] // Pass plain address, approveSession will format it
      await walletConnectService.approveSession(
        proposal.params.id,
        accounts,
        proposal,
      )
      console.log("WalletConnectModal: Proposal approved and session created")
      handleClose()
    } catch (err) {
      console.error("Failed to approve proposal:", err)
      setError(
        err instanceof Error ? err.message : "Failed to approve proposal",
      )
      setIsLoading(false)
    }
  }

  const handleProposalReject = async () => {
    if (!proposal) return

    try {
      setIsLoading(true)
      await walletConnectService.rejectSession(proposal.params.id)
      handleClose()
    } catch (err) {
      console.error("Failed to reject proposal:", err)
      setError(err instanceof Error ? err.message : "Failed to reject proposal")
      setIsLoading(false)
    }
  }

  const handleRequestApprove = async () => {
    if (!request) return

    try {
      setIsLoading(true)
      setError(null)

      await walletConnectService.handleSessionRequest(request)

      const method = request.params.request.method
      console.log(
        `WalletConnectModal: Request ${method} approved and sent successfully`,
      )

      handleClose()
    } catch (err) {
      console.error("Failed to approve request:", err)
      setError(err instanceof Error ? err.message : "Failed to approve request")
      setIsLoading(false)
    }
  }

  const handleRequestReject = async () => {
    if (!request) return

    try {
      setIsLoading(true)
      const walletKit = walletConnectService.getWalletKit()
      if (!walletKit) {
        throw new Error("WalletConnect not initialized")
      }

      await walletKit.respondSessionRequest({
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: "2.0",
          error: {
            code: 4001,
            message: "User rejected the request",
          },
        },
      })

      walletConnectService.removePendingRequest(request.id)
      handleClose()
    } catch (err) {
      console.error("Failed to reject request:", err)
      setError(err instanceof Error ? err.message : "Failed to reject request")
      setIsLoading(false)
    }
  }

  if (!isOpen || (!request && !proposal)) {
    return null
  }

  // Get dApp origin for request
  const dAppOrigin = request
    ? (() => {
        const sessions = walletConnectService.getActiveSessions()
        const session = sessions.find((s) => s.topic === request.topic)
        return session?.peer.metadata.url || window.location.origin
      })()
    : proposal?.params.proposer.metadata.url || window.location.origin

  return (
    <ModalAdvanced
      isModalOpen={isOpen}
      isModalOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          handleClose()
        }
      }}
      title={proposal ? "Connect Wallet" : "WalletConnect Request"}
      subTitle={
        proposal
          ? "A dApp wants to connect to your wallet"
          : "Approve or reject this request"
      }
      large
    >
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {proposal ? (
        <WalletConnectProposal
          proposal={proposal}
          ethAddress={ethAddress}
          isLoading={isLoading}
          isLoadingAddress={isLoadingAddress}
          onApprove={handleProposalApprove}
          onReject={handleProposalReject}
        />
      ) : request ? (
        <WalletConnectRequest
          request={request}
          dAppOrigin={dAppOrigin}
          isLoading={isLoading}
          onApprove={handleRequestApprove}
          onReject={handleRequestReject}
        />
      ) : null}
    </ModalAdvanced>
  )
}

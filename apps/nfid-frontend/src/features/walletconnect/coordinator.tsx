import { useMachine } from "@xstate/react"
import { useCallback, useEffect, useState } from "react"

import { BlurredLoader } from "@nfid-frontend/ui"
import { SignClientTypes } from "@walletconnect/types"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import NFIDAuthMachine from "../authentication/nfid/nfid-machine"
import { walletConnectService } from "frontend/integration/walletconnect"
import { WalletConnectApproveConnection } from "./components/approve-connection"
import { WalletConnectSignMessage } from "./components/sign-message"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { InfuraProvider } from "ethers"
import { INFURA_API_KEY } from "@nfid/integration/token/constants"
import { WalletConnectTemplate } from "./components/template"
import { WCGasData } from "./types"

export default function WalletConnectCoordinator() {
  const [uri, setUri] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<number | null>(null)
  const [sessionTopic, setSessionTopic] = useState<string | null>(null)
  const [proposal, setProposal] = useState<
    SignClientTypes.EventArguments["session_proposal"] | null
  >(null)
  const [request, setRequest] = useState<
    SignClientTypes.EventArguments["session_request"] | null
  >(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ethAddress, setEthAddress] = useState<string | null>(null)
  const [authState] = useMachine(NFIDAuthMachine)
  const [fee, setFee] = useState<WCGasData | undefined>()

  // Parse URL parameters - can be either URI for new connection or requestId/sessionTopic for signing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const uriParam = urlParams.get("uri")
    const requestIdParam = urlParams.get("requestId")
    const sessionTopicParam = urlParams.get("sessionTopic")

    if (uriParam && uriParam.startsWith("wc:")) {
      // New connection request
      setUri(uriParam)
    } else if (requestIdParam && sessionTopicParam) {
      // Signing request for existing session
      const parsedRequestId = parseInt(requestIdParam, 10)
      if (!isNaN(parsedRequestId)) {
        setRequestId(parsedRequestId)
        setSessionTopic(sessionTopicParam)
      } else {
        setError("Invalid requestId parameter")
      }
    } else {
      // No valid parameters found
      setError(
        "Invalid WalletConnect parameters. Expected either ?uri=wc:... or ?requestId=...&sessionTopic=...",
      )
    }
  }, [])

  // Check authentication status
  const { isAuthenticated } = useAuthentication()
  // Load Ethereum address when authenticated
  useEffect(() => {
    if (isAuthenticated && !ethAddress) {
      walletConnectService
        .getEthereumAddress()
        .then(setEthAddress)
        .catch((err) => {
          console.error("Failed to get Ethereum address:", err)
        })
    }
  }, [isAuthenticated, ethAddress])

  // Initialize WalletConnect and connect via URI when authenticated
  useEffect(() => {
    if (!uri || !isAuthenticated || isConnecting || proposal) {
      return
    }

    const connect = async () => {
      try {
        setIsConnecting(true)
        setError(null)

        // Initialize WalletConnect if not already initialized
        if (!walletConnectService.getInitialized()) {
          await walletConnectService.initialize()
        }

        // Connect via URI - this will trigger session_proposal event
        await walletConnectService.connectViaUri(uri)
      } catch (err) {
        console.error("Failed to connect via WalletConnect URI:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to connect via WalletConnect",
        )
        setIsConnecting(false)
      }
    }

    connect()
  }, [uri, isAuthenticated, isConnecting, proposal])

  // Load request by requestId and sessionTopic when authenticated
  useEffect(() => {
    if (!requestId || !sessionTopic || !isAuthenticated || request) {
      return
    }

    const loadRequest = async () => {
      try {
        setError(null)

        // Initialize WalletConnect if not already initialized
        if (!walletConnectService.getInitialized()) {
          await walletConnectService.initialize()
        }

        // Try to find the request by ID and topic
        const pendingRequest = walletConnectService.findPendingRequest(
          requestId,
          sessionTopic,
        )

        if (pendingRequest) {
          setRequest(pendingRequest)
          console.log(
            "WalletConnectCoordinator: Request found in pending requests",
            { requestId, sessionTopic },
          )
        }
      } catch (err) {
        console.error("Failed to load WalletConnect request:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load WalletConnect request",
        )
      }
    }

    loadRequest()
  }, [requestId, sessionTopic, isAuthenticated, request])

  // Listen for session_proposal event
  useEffect(() => {
    const handleProposal = (event: CustomEvent) => {
      const proposalEvent =
        event.detail as SignClientTypes.EventArguments["session_proposal"]
      console.log("WalletConnectCoordinator: Proposal received", proposalEvent)
      setProposal(proposalEvent)
      setIsConnecting(false)
    }

    // Also check for pending proposal on mount
    const pendingProposal = walletConnectService.getPendingProposal()
    if (pendingProposal) {
      setProposal(pendingProposal)
      setIsConnecting(false)
    }

    window.addEventListener(
      "walletconnect:proposal",
      handleProposal as EventListener,
    )

    return () => {
      window.removeEventListener(
        "walletconnect:proposal",
        handleProposal as EventListener,
      )
    }
  }, [])

  // Listen for session_request event (signing requests)
  useEffect(() => {
    const handleRequest = (event: CustomEvent) => {
      const requestEvent =
        event.detail as SignClientTypes.EventArguments["session_request"]
      console.log("WalletConnectCoordinator: Request received", requestEvent)

      // If we're waiting for a specific requestId and sessionTopic, verify it matches
      if (requestId && sessionTopic) {
        if (
          requestEvent.id === requestId &&
          requestEvent.topic === sessionTopic
        ) {
          setRequest(requestEvent)
          setProposal(null) // Clear proposal when request comes in
          setError(null) // Clear any previous errors
          console.log(
            "WalletConnectCoordinator: Matching request found and set",
            { requestId, sessionTopic },
          )
        } else {
          // Check all pending requests to see if our requested one is there
          const allPendingRequests =
            walletConnectService.getAllPendingRequests()
          const matchingRequest = allPendingRequests.find(
            (r) => r.id === requestId && r.topic === sessionTopic,
          )

          if (matchingRequest) {
            console.log(
              "WalletConnectCoordinator: Found matching request in pending requests after event",
              { requestId, sessionTopic },
            )
            setRequest(matchingRequest)
            setProposal(null)
            setError(null)
          } else {
            console.log(
              "WalletConnectCoordinator: Request received but doesn't match expected requestId/topic",
              {
                received: { id: requestEvent.id, topic: requestEvent.topic },
                expected: { requestId, sessionTopic },
                allPendingRequests: allPendingRequests.map((r) => ({
                  id: r.id,
                  topic: r.topic,
                })),
              },
            )
          }
        }
      } else {
        // No specific request expected, just set it
        setRequest(requestEvent)
        setProposal(null) // Clear proposal when request comes in
      }
    }

    window.addEventListener(
      "walletconnect:request",
      handleRequest as EventListener,
    )

    return () => {
      window.removeEventListener(
        "walletconnect:request",
        handleRequest as EventListener,
      )
    }
  }, [requestId, sessionTopic])

  // Handle approve connection
  const handleApprove = async () => {
    if (!proposal || !ethAddress) {
      setError("Missing proposal or Ethereum address")
      return
    }

    try {
      setError(null)
      await walletConnectService.approveSession(
        proposal.params.id,
        [ethAddress],
        proposal,
      )
      // Session approved - close the window
      console.log(
        "WalletConnect: Session approved successfully, closing window",
      )

      // Close the window if it was opened as a popup or can be closed
      // Small delay to ensure the session response is sent
      setTimeout(() => {
        if (window.opener) {
          // This is a popup window, close it
          window.close()
        } else {
          // Try to close anyway (may not work in all browsers for security reasons)
          window.close()
        }
      }, 500)
    } catch (err) {
      console.error("Failed to approve session:", err)
      setError(err instanceof Error ? err.message : "Failed to approve session")
    }
  }

  // Handle reject connection
  const handleReject = async () => {
    if (!proposal) {
      // Close window even if no proposal
      window.close()
      return
    }

    try {
      await walletConnectService.rejectSession(proposal.params.id)
      // Reset state
      setProposal(null)
      setUri(null)

      // Close the window after rejecting
      console.log("WalletConnect: Session rejected, closing window")
      setTimeout(() => {
        if (window.opener) {
          // This is a popup window, close it
          window.close()
        } else {
          // Try to close anyway (may not work in all browsers for security reasons)
          window.close()
        }
      }, 300)
    } catch (err) {
      console.error("Failed to reject session:", err)
      setError(err instanceof Error ? err.message : "Failed to reject session")
      // Still try to close the window even if rejection failed
      setTimeout(() => {
        window.close()
      }, 300)
    }
  }

  // Estimate gas
  useEffect(() => {
    if (!request) return

    const method = request.params.request.method
    const isTransaction =
      method === "eth_signTransaction" || method === "eth_sendTransaction"

    if (!isTransaction) return

    const getFee = async () => {
      const chainId = BigInt(request.params.chainId.split(":")[1])
      const provider = new InfuraProvider(chainId, INFURA_API_KEY)
      const feeData = await provider.getFeeData()
      const { maxFeePerGas, maxPriorityFeePerGas } = feeData

      if (maxFeePerGas === null || maxPriorityFeePerGas === null) {
        throw new Error(
          "Gas fee data is missing from network. Please provide maxFeePerGas and maxPriorityFeePerGas in transaction.",
        )
      }

      const [block, gasUsed] = await Promise.all([
        provider.getBlock("latest"),
        provider.estimateGas({
          to: request.params.request.params.to,
          from: request.params.request.params.from,
          value: request.params.request.params.value,
        }),
      ])

      setFee({
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasUsed,
        baseFeePerGas: block?.baseFeePerGas ?? BigInt(0),
        total: gasUsed * maxFeePerGas,
      })
    }

    getFee()
  }, [request])

  // Handle sign message
  const handleSign = useCallback(async () => {
    if (!request) {
      setError("Missing request or gas")
      return
    }

    try {
      setError(null)
      await walletConnectService.handleSessionRequest(request, fee)

      setTimeout(() => {
        if (window.opener) {
          window.close()
        } else {
          window.close()
        }
      }, 500)
    } catch (err) {
      console.error("Failed to sign message:", err)
      setError(err instanceof Error ? err.message : "Failed to sign message")
    }
  }, [fee, request])

  // Handle cancel sign message
  const handleCancelSign = async () => {
    if (!request) {
      window.close()
      return
    }

    try {
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
      setRequest(null)

      // Close the window after rejecting
      console.log("WalletConnect: Sign request rejected, closing window")
      setTimeout(() => {
        window.close()
      }, 300)
    } catch (err) {
      console.error("Failed to reject sign request:", err)
      setError(
        err instanceof Error ? err.message : "Failed to reject sign request",
      )
      // Still try to close the window
      setTimeout(() => {
        window.close()
      }, 300)
    }
  }

  //  1. Approve connection screen
  if (proposal) {
    return (
      <WalletConnectTemplate isApproveRequestInProgress={false}>
        <WalletConnectApproveConnection
          dAppMetadata={proposal.params.proposer.metadata}
          optionalNamespaces={proposal.params.optionalNamespaces}
          validationStatus={
            proposal.verifyContext.verified.validation ?? "UNKNOWN"
          }
          ethAddress={ethAddress}
          onApprove={handleApprove}
          onReject={handleReject}
          error={error}
        />
      </WalletConnectTemplate>
    )
  }

  // 2. Sign message/transaction screen
  if (request) {
    const sessions = walletConnectService.getActiveSessions()
    const session = sessions.find((s) => s.topic === request.topic)
    const dAppOrigin = session?.peer.metadata.url || window.location.origin
    const method = request.params.request.method
    const isTransaction =
      method === "eth_signTransaction" || method === "eth_sendTransaction"

    return (
      <WalletConnectTemplate isApproveRequestInProgress={isTransaction}>
        <WalletConnectSignMessage
          request={request}
          dAppOrigin={dAppOrigin}
          onSign={handleSign}
          onCancel={handleCancelSign}
          error={error}
          validationStatus={
            request.verifyContext.verified.validation ?? "UNKNOWN"
          }
          chainId={request?.params.chainId}
          fee={fee}
        />
      </WalletConnectTemplate>
    )
  }

  // 3. Error screen if any (but not if we have a request or proposal to show)
  if (error && !proposal && !request) {
    return (
      <WalletConnectTemplate isApproveRequestInProgress={false}>
        <div className="p-6">
          <div className="p-3 border border-red-200 rounded-lg bg-red-50">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </WalletConnectTemplate>
    )
  }

  // 4. Loading state screen while connecting
  if (isConnecting && !proposal) {
    return (
      <WalletConnectTemplate isApproveRequestInProgress={false}>
        <BlurredLoader
          isLoading
          loadingMessage="Connecting to WalletConnect..."
        />
      </WalletConnectTemplate>
    )
  }

  // 5. Authentication screen if not authenticated
  if (!isAuthenticated) {
    if (authState.matches("AuthenticationMachine")) {
      return (
        <WalletConnectTemplate isApproveRequestInProgress={false}>
          <AuthenticationCoordinator
            isIdentityKit
            actor={
              authState.children
                .AuthenticationMachine as AuthenticationMachineActor
            }
            loader={
              <BlurredLoader isLoading loadingMessage="Authenticating..." />
            }
          />
        </WalletConnectTemplate>
      )
    }

    return (
      <WalletConnectTemplate isApproveRequestInProgress={false}>
        <BlurredLoader
          isLoading
          loadingMessage="Initializing authentication..."
        />
      </WalletConnectTemplate>
    )
  }

  // 6. Loading state screen
  return (
    <WalletConnectTemplate isApproveRequestInProgress={false}>
      <BlurredLoader isLoading loadingMessage="Initializing..." />
    </WalletConnectTemplate>
  )
}

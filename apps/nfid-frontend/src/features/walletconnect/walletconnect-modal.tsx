import React, { useState, useEffect, useCallback } from "react"
import { SignClientTypes } from "@walletconnect/types"

import { ModalAdvanced } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"
import { walletConnectService } from "frontend/integration/walletconnect"
import { WalletConnectRequest } from "./components/walletconnect-request"
import { WalletConnectProposal } from "./components/walletconnect-proposal"
import { chainFusionSignerService } from "frontend/integration/bitcoin/services/chain-fusion-signer.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { InfuraProvider } from "ethers"
import { INFURA_API_KEY, CHAIN_ID } from "@nfid/integration/token/constants"
import { EthSignTransactionRequest } from "frontend/integration/bitcoin/idl/chain-fusion-signer.d"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

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
  const [error, setError] = useState<string | null>(null)

  const loadEthAddress = useCallback(async () => {
    try {
      const { delegationIdentity } = authState.get()
      if (delegationIdentity) {
        const address = await walletConnectService.getEthereumAddress()
        setEthAddress(address)
      }
    } catch (err) {
      console.debug("Failed to get Ethereum address:", err)
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
      const accounts = [`eip155:1:${ethAddress}`]
      await walletConnectService.approveSession(proposal.params.id, accounts)
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

      // Get identity
      let identity = await getWalletDelegation()

      // Process the request based on method
      const method = request.params.request.method
      const params = request.params.request.params

      let result: any

      switch (method) {
        case "personal_sign": {
          const [messageHex, address] = params as [string, string]
          // Canister expects hex string, so we need to convert message to hex if it's not already
          let message: string
          if (messageHex.startsWith("0x")) {
            // Already hex, use as is (without 0x prefix for canister)
            message = messageHex.slice(2)
          } else {
            // Convert UTF-8 string to hex
            message = Buffer.from(messageHex, "utf8").toString("hex")
          }
          result = await chainFusionSignerService.ethPersonalSign(
            identity,
            message,
          )
          break
        }
        case "eth_sign": {
          const [, hash] = params as [string, string]
          // Canister expects hex string without 0x prefix
          const hashHex = hash.startsWith("0x") ? hash.slice(2) : hash
          result = await chainFusionSignerService.ethSignPrehash(
            identity,
            hashHex,
          )
          break
        }
        case "eth_signTransaction": {
          const [tx] = params as [any]

          // Helper functions to parse hex values
          const parseValue = (val: string | undefined): bigint => {
            if (!val || val === "0x" || val === "0x0") return BigInt(0)
            if (val.startsWith("0x")) return BigInt(val)
            return BigInt(val)
          }

          const parseGas = (gas: string | number | undefined): bigint => {
            if (!gas) return BigInt(0)
            if (typeof gas === "number") return BigInt(gas)
            if (gas.startsWith("0x")) return BigInt(gas)
            return BigInt(gas)
          }

          // Process data field - ensure it's hex string without 0x prefix if provided
          let processedData: [] | [string] = []
          if (tx.data && tx.data !== "0x" && tx.data !== "") {
            const dataHex = tx.data.startsWith("0x")
              ? tx.data.slice(2)
              : tx.data
            processedData = [dataHex]
          }

          const txRequest: EthSignTransactionRequest = {
            to: tx.to,
            value: parseValue(tx.value),
            gas: parseGas(tx.gas || tx.gasLimit),
            max_priority_fee_per_gas: parseGas(tx.maxPriorityFeePerGas),
            max_fee_per_gas: parseGas(tx.maxFeePerGas || tx.gasPrice),
            chain_id: BigInt(tx.chainId || 1),
            nonce: BigInt(tx.nonce || 0),
            data: processedData,
          }

          result = await chainFusionSignerService.ethSignTransaction(
            identity,
            txRequest,
          )
          break
        }
        case "eth_sendTransaction": {
          const [tx] = params as [any]
          const fromAddress = await ethereumService.getAddress(identity)
          let nonce: bigint
          if (tx.nonce !== undefined && tx.nonce !== null) {
            nonce = BigInt(tx.nonce)
          } else {
            const transactionCount =
              await ethereumService.getTransactionCount(fromAddress)
            nonce = BigInt(transactionCount)
          }
          const parseValue = (val: string | undefined): bigint => {
            if (!val || val === "0x" || val === "0x0") return BigInt(0)
            if (val.startsWith("0x")) return BigInt(val)
            return BigInt(val)
          }
          const parseGas = (gas: string | number | undefined): bigint => {
            if (!gas) return BigInt(0)
            if (typeof gas === "number") return BigInt(gas)
            if (gas.startsWith("0x")) return BigInt(gas)
            return BigInt(gas)
          }
          const txRequest: EthSignTransactionRequest = {
            to: tx.to,
            value: parseValue(tx.value),
            gas: parseGas(tx.gas || tx.gasLimit),
            max_priority_fee_per_gas: parseGas(tx.maxPriorityFeePerGas),
            max_fee_per_gas: parseGas(tx.maxFeePerGas || tx.gasPrice),
            chain_id: BigInt(tx.chainId || 1),
            nonce: nonce,
            data: tx.data ? [tx.data] : [],
          }
          const signature = await chainFusionSignerService.ethSignTransaction(
            identity,
            txRequest,
          )
          const provider = new InfuraProvider(CHAIN_ID, INFURA_API_KEY)
          const response = await provider.broadcastTransaction(signature)
          await response.wait()
          result = response.hash
          break
        }
        default:
          throw new Error(`Unsupported method: ${method}`)
      }

      const signClient = walletConnectService.getSignClient()
      if (!signClient) {
        throw new Error("WalletConnect not initialized")
      }

      // Send response back to WalletConnect
      await signClient.respond({
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: "2.0",
          result,
        },
      })

      console.log(
        `WalletConnectModal: Request ${method} approved and sent successfully`,
      )

      // Remove pending request
      walletConnectService.removePendingRequest(request.id)

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
      const signClient = walletConnectService.getSignClient()
      if (!signClient) {
        throw new Error("WalletConnect not initialized")
      }

      await signClient.respond({
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

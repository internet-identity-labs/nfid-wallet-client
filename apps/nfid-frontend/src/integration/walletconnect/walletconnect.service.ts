import { Core } from "@walletconnect/core"
import { WalletKit } from "@reown/walletkit"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import { SignIdentity } from "@dfinity/agent"
import { InfuraProvider, TypedDataEncoder } from "ethers"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { chainFusionSignerService } from "frontend/integration/bitcoin/services/chain-fusion-signer.service"
import { EthSignTransactionRequest } from "frontend/integration/bitcoin/idl/chain-fusion-signer.d"
import { INFURA_API_KEY } from "@nfid/integration/token/constants"
import { EthereumTransactionParams } from "frontend/features/walletconnect/components/walletconnect-request"
import { NAMESPACES } from "./constants"

import {
  WALLETCONNECT_PROJECT_ID,
  WALLETCONNECT_METADATA,
  ETH_METHODS,
  ETH_EVENTS,
} from "./constants"
import { getWalletDelegation } from "../facade/wallet"

/**
 * WalletConnect Service for NFID Wallet using WalletKit
 *
 * This service handles WalletConnect protocol integration, allowing dApps
 * to connect to NFID Wallet and request transaction signing.
 */
export class WalletConnectService {
  private walletKit: InstanceType<typeof WalletKit> | null = null
  private core: InstanceType<typeof Core> | null = null
  private isInitialized = false
  private activeSessions: Map<string, SessionTypes.Struct> = new Map()
  private pendingProposal:
    | SignClientTypes.EventArguments["session_proposal"]
    | null = null
  private pendingRequests: Map<
    number,
    SignClientTypes.EventArguments["session_request"]
  > = new Map()

  /**
   * Initialize WalletConnect WalletKit
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // Initialize Core first
      this.core = new Core({
        projectId: WALLETCONNECT_PROJECT_ID,
      })

      // Initialize WalletKit with Core
      this.walletKit = await WalletKit.init({
        core: this.core,
        metadata: WALLETCONNECT_METADATA,
      })

      this.setupEventHandlers()
      this.loadExistingSessions()
      this.isInitialized = true

      // Expose to window for debugging
      if (typeof window !== "undefined") {
        (window as any).walletConnectService = this
      }
    } catch (error) {
      console.error("Failed to initialize WalletConnect:", error)
      throw error
    }
  }

  /**
   * Setup event handlers for WalletConnect events
   */
  private setupEventHandlers(): void {
    if (!this.walletKit) return

    // Handle session proposal (connection request from dApp)
    this.walletKit.on(
      "session_proposal",
      async (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
        console.log("WalletConnect: Session proposal received")
        console.log("WalletConnect: Proposal structure:", {
          id: proposal.params.id,
          proposer: proposal.params.proposer,
          requiredNamespaces: proposal.params.requiredNamespaces,
          optionalNamespaces: proposal.params.optionalNamespaces,
        })

        // Store pending proposal
        this.pendingProposal = proposal

        // Emit custom event for UI to handle
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("walletconnect:proposal", { detail: proposal }),
          )
        }
      },
    )

    // Handle session request (signing request from dApp)
    this.walletKit.on(
      "session_request",
      async (request: SignClientTypes.EventArguments["session_request"]) => {
        console.log(
          "WalletConnect: Session request received",
          request.params.request.method,
        )

        // Verify session exists and sync if needed
        const session = this.activeSessions.get(request.topic)
        if (!session && this.walletKit) {
          const allSessions = this.walletKit.getActiveSessions()
          // getActiveSessions returns Record<string, SessionTypes.Struct>
          const foundSession = Object.values(allSessions).find(
            (s) => (s as SessionTypes.Struct).topic === request.topic,
          ) as SessionTypes.Struct | undefined
          if (foundSession) {
            this.activeSessions.set(foundSession.topic, foundSession)
          } else {
            console.debug(
              "WalletConnect: Session not found for topic:",
              request.topic,
            )
          }
        }

        // Store request for retrieval
        this.pendingRequests.set(request.id, request)

        // Emit custom event for UI to handle
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("walletconnect:request", { detail: request }),
          )
        }
      },
    )

    // Handle session deletion (disconnection)
    this.walletKit.on(
      "session_delete",
      (event: SignClientTypes.EventArguments["session_delete"]) => {
        this.activeSessions.delete(event.topic)
      },
    )

    // Note: WalletKit doesn't have session_expire event
    // Session expiration is handled automatically by WalletKit
  }

  /**
   * Load existing sessions from storage
   */
  private loadExistingSessions(): void {
    if (!this.walletKit) return

    const sessions = this.walletKit.getActiveSessions()
    // getActiveSessions returns Record<string, SessionTypes.Struct>
    Object.values(sessions).forEach((session) => {
      const typedSession = session as SessionTypes.Struct
      this.activeSessions.set(typedSession.topic, typedSession)
    })
  }

  /**
   * Get pending session proposal
   */
  getPendingProposal():
    | SignClientTypes.EventArguments["session_proposal"]
    | null {
    return this.pendingProposal
  }

  /**
   * Clear pending proposal
   */
  clearPendingProposal(): void {
    this.pendingProposal = null
  }

  /**
   * Approve session proposal (connect to dApp)
   */
  async approveSession(
    proposalId: number,
    accounts: string[],
    proposal?: SignClientTypes.EventArguments["session_proposal"],
  ): Promise<SessionTypes.Struct> {
    if (!this.walletKit) {
      throw new Error("WalletConnect not initialized")
    }

    if (!proposal) {
      throw new Error("Proposal is required")
    }

    try {
      const namespaces: SessionTypes.Namespaces = {}

      // Get chains from namespace - must have at least one
      const formattedAccounts = accounts.map((account) => {
        return NAMESPACES.eip155.chains.map((c) => `${c}:${account}`)
      })

      namespaces["eip155"] = {
        accounts: formattedAccounts.flat(),
        methods: Array.from(ETH_METHODS),
        events: Array.from(ETH_EVENTS),
      }
      // Use WalletKit's approveSession method
      const session = await this.walletKit.approveSession({
        id: proposalId,
        namespaces,
      })

      this.activeSessions.set(session.topic, session)
      this.pendingProposal = null

      console.log("WalletConnect: Session approved successfully")

      return session
    } catch (error) {
      console.error("Failed to approve session:", error)
      throw error
    }
  }

  /**
   * Reject session proposal
   */
  async rejectSession(proposalId: number): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletConnect not initialized")
    }

    try {
      await this.walletKit.rejectSession({
        id: proposalId,
        reason: getSdkError("USER_REJECTED"),
      })
      this.pendingProposal = null
    } catch (error) {
      console.error("Failed to reject session:", error)
      throw error
    }
  }

  /**
   * Get Ethereum address from current identity
   */
  async getEthereumAddress(): Promise<string> {
    try {
      const address = await ethereumService.getQuickAddress()
      return address
    } catch (error) {
      console.error("Failed to get Ethereum address:", error)
      throw error
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): SessionTypes.Struct[] {
    // Sync with WalletKit storage
    if (this.walletKit) {
      const allSessions = this.walletKit.getActiveSessions()
      // getActiveSessions returns Record<string, SessionTypes.Struct>
      Object.values(allSessions).forEach((session) => {
        const typedSession = session as SessionTypes.Struct
        if (!this.activeSessions.has(typedSession.topic)) {
          this.activeSessions.set(typedSession.topic, typedSession)
        }
      })
    }
    return Array.from(this.activeSessions.values())
  }

  /**
   * Check if a session with specific topic exists
   */
  hasSession(topic: string): boolean {
    if (!this.walletKit) return false

    const allSessions = this.walletKit.getActiveSessions()
    // getActiveSessions returns Record<string, SessionTypes.Struct>
    return Object.values(allSessions).some(
      (s) => (s as SessionTypes.Struct).topic === topic,
    )
  }

  /**
   * Disconnect session
   */
  async disconnectSession(topic: string): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletConnect not initialized")
    }

    try {
      await this.walletKit.disconnectSession({
        topic,
        reason: getSdkError("USER_DISCONNECTED"),
      })
      this.activeSessions.delete(topic)
    } catch (error) {
      console.error("Failed to disconnect session:", error)
      throw error
    }
  }

  /**
   * Connect via URI (for local testing or deep links)
   * This allows connecting by pasting the WalletConnect URI from the QR code
   */
  async connectViaUri(uri: string): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletConnect not initialized")
    }

    try {
      // Parse and pair with the URI
      await this.walletKit.pair({ uri })
    } catch (error) {
      console.error("Failed to connect via URI:", error)
      throw error
    }
  }

  /**
   * Get pending request by ID
   */
  getPendingRequest(
    requestId: number,
  ): SignClientTypes.EventArguments["session_request"] | null {
    return this.pendingRequests.get(requestId) || null
  }

  /**
   * Remove pending request
   */
  removePendingRequest(requestId: number): void {
    this.pendingRequests.delete(requestId)
  }

  /**
   * Get WalletKit instance (for advanced usage)
   */
  getWalletKit(): InstanceType<typeof WalletKit> | null {
    return this.walletKit
  }

  /**
   * Check if WalletConnect is initialized
   */
  getInitialized(): boolean {
    return this.isInitialized
  }

  /**
   * Cleanup and disconnect all sessions
   */
  async cleanup(): Promise<void> {
    if (!this.walletKit) return

    // Disconnect all active sessions
    for (const topic of this.activeSessions.keys()) {
      try {
        await this.disconnectSession(topic)
      } catch (error) {
        console.error(`Failed to disconnect session ${topic}:`, error)
      }
    }

    this.activeSessions.clear()
    this.isInitialized = false
  }

  /**
   * Handle WalletConnect session request
   */
  async handleSessionRequest(
    request: SignClientTypes.EventArguments["session_request"],
  ): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletConnect not initialized")
    }

    const identity = await getWalletDelegation()

    const method = request.params.request.method
    const params = request.params.request.params

    let result: any

    switch (method) {
      case "personal_sign": {
        result = await this.handlePersonalSign(
          identity,
          params as [string, string],
        )
        break
      }
      case "eth_sign": {
        result = await this.handleEthSign(identity, params as [string, string])
        break
      }
      case "eth_signTransaction": {
        result = await this.handleEthSignTransaction(
          identity,
          params as [EthereumTransactionParams],
        )
        break
      }
      case "eth_sendTransaction": {
        result = await this.handleEthSendTransaction(
          identity,
          params as [EthereumTransactionParams],
        )
        break
      }
      case "eth_signTypedData":
      case "eth_signTypedData_v4": {
        result = await this.handleEthSignTypedData(
          identity,
          params as [string, any],
        )
        break
      }
      default:
        throw new Error(`Unsupported method: ${method}`)
    }

    // Send response back to WalletConnect using WalletKit
    await this.walletKit.respondSessionRequest({
      topic: request.topic,
      response: {
        id: request.id,
        jsonrpc: "2.0",
        result,
      },
    })

    // Remove pending request
    this.removePendingRequest(request.id)
  }

  /**
   * Handle personal_sign request
   */
  private async handlePersonalSign(
    identity: SignIdentity,
    params: [string, string],
  ): Promise<string> {
    const [messageHex] = params
    // Canister expects hex string, so we need to convert message to hex if it's not already
    let message: string
    if (messageHex.startsWith("0x")) {
      // Already hex, use as is (without 0x prefix for canister)
      message = messageHex.slice(2)
    } else {
      // Convert UTF-8 string to hex
      message = Buffer.from(messageHex, "utf8").toString("hex")
    }
    return await chainFusionSignerService.ethPersonalSign(identity, message)
  }

  /**
   * Handle eth_sign request
   */
  private async handleEthSign(
    identity: SignIdentity,
    params: [string, string],
  ): Promise<string> {
    const [, hash] = params
    // Canister expects hex string without 0x prefix
    const hashHex = hash.startsWith("0x") ? hash.slice(2) : hash
    return await chainFusionSignerService.ethSignPrehash(identity, hashHex)
  }

  /**
   * Handle eth_signTypedData_v4 request
   */
  private async handleEthSignTypedData(
    identity: SignIdentity,
    params: [string, any],
  ): Promise<string> {
    const [address, typedData] = params

    // Validate address matches identity
    const fromAddressQuick = await ethereumService.getQuickAddress()
    if (address.toLowerCase() !== fromAddressQuick.toLowerCase()) {
      throw new Error(
        "Typed data 'from' address is not the same as the identity address",
      )
    }

    // Parse typedData if it's a string
    let parsedTypedData: any = typedData
    if (typeof typedData === "string") {
      try {
        parsedTypedData = JSON.parse(typedData)
      } catch (parseError) {
        throw new Error(
          `Invalid JSON format for typed data: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        )
      }
    }

    // Validate typedData structure
    if (!parsedTypedData) {
      throw new Error("Typed data is required")
    }

    if (!parsedTypedData.domain) {
      throw new Error("Typed data domain is required")
    }

    if (!parsedTypedData.types) {
      throw new Error("Typed data types are required")
    }

    if (!parsedTypedData.message) {
      throw new Error("Typed data message is required")
    }

    // Normalize chainId to number if it's a string
    if (
      parsedTypedData.domain.chainId !== undefined &&
      typeof parsedTypedData.domain.chainId === "string"
    ) {
      parsedTypedData.domain.chainId = parseInt(
        parsedTypedData.domain.chainId,
        10,
      )
    }

    // Remove EIP712Domain from types - it's added automatically by ethers
    const typesWithoutDomain = { ...parsedTypedData.types }
    delete typesWithoutDomain.EIP712Domain

    // Validate primaryType exists
    if (!parsedTypedData.primaryType) {
      throw new Error("Typed data primaryType is required")
    }

    // Compute EIP-712 hash using ethers TypedDataEncoder
    const hash = TypedDataEncoder.hash(
      parsedTypedData.domain,
      typesWithoutDomain,
      parsedTypedData.message,
    )

    // Canister expects hex string without 0x prefix
    const hashHex = hash.startsWith("0x") ? hash.slice(2) : hash

    // Sign the hash using ethSignPrehash
    return await chainFusionSignerService.ethSignPrehash(identity, hashHex)
  }

  /**
   * Prepare transaction request from Ethereum transaction params
   */
  private async prepareTransactionRequest(
    identity: SignIdentity,
    tx: EthereumTransactionParams,
  ): Promise<EthSignTransactionRequest> {
    const fromAddressQuick = await ethereumService.getQuickAddress()
    if (tx.from !== fromAddressQuick) {
      throw new Error(
        "Transaction 'from' address is not the same as the identity address",
      )
    }
    if (!tx.to) {
      throw new Error("Transaction 'to' address is required")
    }
    if (tx.gas === undefined && tx.gasLimit === undefined) {
      throw new Error("Transaction 'gas' or 'gasLimit' is required")
    }
    if (tx.maxFeePerGas === undefined && tx.gasPrice === undefined) {
      throw new Error("Transaction must include maxFeePerGas or gasPrice")
    }
    if (tx.chainId === undefined) {
      throw new Error("Transaction 'chainId' is required")
    }

    const fromAddress = await ethereumService.getAddress(identity)

    // NONCE
    let nonce: bigint
    if (tx.nonce !== undefined && tx.nonce !== null) {
      nonce = BigInt(tx.nonce)
    } else {
      const transactionCount =
        await ethereumService.getTransactionCount(fromAddress)
      nonce = BigInt(transactionCount)
    }

    // Helpers
    const parseValue = (val: string | undefined): bigint => {
      if (!val || val === "0x" || val === "0x0") return BigInt(0)
      if (val.startsWith("0x")) return BigInt(val)
      return BigInt(val)
    }

    const parseGas = (gas: string | number | undefined): bigint => {
      if (gas === undefined) throw new Error("Gas value is required")
      if (typeof gas === "number") return BigInt(gas)
      if (gas.startsWith("0x")) return BigInt(gas)
      return BigInt(gas)
    }

    // GAS LOGIC (correct for WC + EIP-1559)
    let maxFeePerGas: bigint = BigInt(0)
    let maxPriorityFeePerGas: bigint = BigInt(0)

    if (tx.maxFeePerGas !== undefined) {
      // EIP-1559 tx from dApp
      maxFeePerGas = parseGas(tx.maxFeePerGas)

      if (tx.maxPriorityFeePerGas !== undefined) {
        maxPriorityFeePerGas = parseGas(tx.maxPriorityFeePerGas)
      } else {
        // Default tip = 1 wei (avoids "gas tip cap 0" error)
        maxPriorityFeePerGas = BigInt(1)
      }
    } else if (tx.gasPrice !== undefined) {
      // Legacy → Convert to EIP-1559 compatible
      const gasPrice = parseGas(tx.gasPrice)

      // Gas price becomes BOTH fee and tip
      maxFeePerGas = gasPrice
      maxPriorityFeePerGas = gasPrice
    }

    // Final TX object
    return {
      to: tx.to,
      value: parseValue(tx.value),
      gas: parseGas(tx.gas || tx.gasLimit),
      max_priority_fee_per_gas: maxPriorityFeePerGas,
      max_fee_per_gas: maxFeePerGas,
      chain_id: BigInt(tx.chainId),
      nonce: nonce,
      data: tx.data ? [tx.data] : [],
    }
  }

  /**
   * Handle eth_signTransaction request
   */
  private async handleEthSignTransaction(
    identity: SignIdentity,
    params: [EthereumTransactionParams],
  ): Promise<string> {
    const [tx] = params
    const txRequest = await this.prepareTransactionRequest(identity, tx)
    return await chainFusionSignerService.ethSignTransaction(
      identity,
      txRequest,
    )
  }

  /**
   * Handle eth_sendTransaction request
   */
  private async handleEthSendTransaction(
    identity: SignIdentity,
    params: [EthereumTransactionParams],
  ): Promise<string> {
    const [tx] = params
    const txRequest = await this.prepareTransactionRequest(identity, tx)

    // SIGN
    const signedTx = await chainFusionSignerService.ethSignTransaction(
      identity,
      txRequest,
    )

    // BROADCAST
    const chainId = Number(tx.chainId!)
    const provider = new InfuraProvider(chainId, INFURA_API_KEY)
    const response = await provider.broadcastTransaction(signedTx)
    await response.wait()

    return response.hash
  }
}

// Singleton instance
export const walletConnectService = new WalletConnectService()

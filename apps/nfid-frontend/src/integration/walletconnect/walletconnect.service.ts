import { SignClient } from "@walletconnect/sign-client"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"

import {
  WALLETCONNECT_PROJECT_ID,
  WALLETCONNECT_METADATA,
  ETH_METHODS,
  ETH_EVENTS,
} from "./constants"

/**
 * WalletConnect Service for NFID Wallet
 *
 * This service handles WalletConnect protocol integration, allowing dApps
 * to connect to NFID Wallet and request transaction signing.
 */
export class WalletConnectService {
  private signClient: InstanceType<typeof SignClient> | null = null
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
   * Initialize WalletConnect SignClient
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      this.signClient = await SignClient.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: WALLETCONNECT_METADATA,
      })

      this.setupEventHandlers()
      this.loadExistingSessions()
      this.isInitialized = true

      // Expose to window for debugging
      if (typeof window !== "undefined") {
        ;(window as any).walletConnectService = this
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
    if (!this.signClient) return

    // Handle session proposal (connection request from dApp)
    this.signClient.on(
      "session_proposal",
      async (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
        console.log("WalletConnect: Session proposal received")

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
    this.signClient.on(
      "session_request",
      async (request: SignClientTypes.EventArguments["session_request"]) => {
        console.log(
          "WalletConnect: Session request received",
          request.params.request.method,
        )

        // Verify session exists and sync if needed
        const session = this.activeSessions.get(request.topic)
        if (!session && this.signClient) {
          const allSessions = this.signClient.session.getAll()
          const foundSession = allSessions.find(
            (s: SessionTypes.Struct) => s.topic === request.topic,
          )
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
    this.signClient.on(
      "session_delete",
      (event: SignClientTypes.EventArguments["session_delete"]) => {
        this.activeSessions.delete(event.topic)
      },
    )

    // Handle session expiration
    this.signClient.on(
      "session_expire",
      (event: SignClientTypes.EventArguments["session_expire"]) => {
        this.activeSessions.delete(event.topic)
      },
    )
  }

  /**
   * Load existing sessions from storage
   */
  private loadExistingSessions(): void {
    if (!this.signClient) return

    const sessions = this.signClient.session.getAll()
    sessions.forEach((session: SessionTypes.Struct) => {
      this.activeSessions.set(session.topic, session)
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
  ): Promise<SessionTypes.Struct> {
    if (!this.signClient) {
      throw new Error("WalletConnect not initialized")
    }

    try {
      const { acknowledged } = await this.signClient.approve({
        id: proposalId,
        namespaces: {
          eip155: {
            accounts: accounts.map((account) => {
              // Ensure account is in format: eip155:chainId:address
              if (account.startsWith("eip155:")) {
                return account
              }
              // Default to mainnet if chainId not specified
              return `eip155:1:${account}`
            }),
            methods: [...ETH_METHODS],
            events: [...ETH_EVENTS],
          },
        },
      })

      const session = await acknowledged()
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
    if (!this.signClient) {
      throw new Error("WalletConnect not initialized")
    }

    try {
      await this.signClient.reject({
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
    // Sync with SignClient storage
    if (this.signClient) {
      const allSessions = this.signClient.session.getAll()
      allSessions.forEach((session: SessionTypes.Struct) => {
        if (!this.activeSessions.has(session.topic)) {
          this.activeSessions.set(session.topic, session)
        }
      })
    }
    return Array.from(this.activeSessions.values())
  }

  /**
   * Check if a session with specific topic exists
   */
  hasSession(topic: string): boolean {
    if (!this.signClient) return false

    const allSessions = this.signClient.session.getAll()
    return allSessions.some((s) => s.topic === topic)
  }

  /**
   * Disconnect session
   */
  async disconnectSession(topic: string): Promise<void> {
    if (!this.signClient) {
      throw new Error("WalletConnect not initialized")
    }

    try {
      await this.signClient.disconnect({
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
    if (!this.signClient) {
      throw new Error("WalletConnect not initialized")
    }

    try {
      // Parse and pair with the URI
      await this.signClient.core.pairing.pair({ uri })
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
   * Get SignClient instance (for advanced usage)
   */
  getSignClient(): InstanceType<typeof SignClient> | null {
    return this.signClient
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
    if (!this.signClient) return

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
}

// Singleton instance
export const walletConnectService = new WalletConnectService()

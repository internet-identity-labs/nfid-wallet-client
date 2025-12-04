import { SignClient } from "@walletconnect/sign-client"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"

import {
  WALLETCONNECT_PROJECT_ID,
  WALLETCONNECT_METADATA,
  ETH_METHODS,
  ETH_EVENTS,
  // ETH_CHAINS,
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
      console.warn("WalletConnect already initialized")
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

      console.log("WalletConnect initialized successfully")
      console.log(
        "WalletConnect: SignClient project ID:",
        WALLETCONNECT_PROJECT_ID,
      )
      console.log(
        "WalletConnect: SignClient core ready:",
        !!this.signClient.core,
      )
      console.log(
        "WalletConnect: SignClient relayer ready:",
        !!this.signClient.core.relayer,
      )

      // Log all sessions after initialization
      const allSessions = this.signClient.session.getAll()
      console.log(
        "WalletConnect: Total sessions after init:",
        allSessions.length,
      )
      allSessions.forEach((session: SessionTypes.Struct) => {
        console.log("WalletConnect: Session details:", {
          topic: session.topic,
          peer: session.peer.metadata.name,
          expiry: session.expiry,
          acknowledged: session.acknowledged,
        })
      })

      // Expose to window for debugging
      if (typeof window !== "undefined") {
        ;(window as any).walletConnectService = this
        console.log(
          "WalletConnect: Service exposed to window.walletConnectService",
        )
        console.log(
          "WalletConnect: You can now use window.walletConnectService in console",
        )
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

    // Log when event handlers are set up
    console.log("WalletConnect: Setting up event handlers")
    console.log("WalletConnect: SignClient ready:", !!this.signClient)
    console.log("WalletConnect: SignClient core ready:", !!this.signClient.core)
    console.log(
      "WalletConnect: SignClient relayer ready:",
      !!this.signClient.core.relayer,
    )

    // Handle session proposal (connection request from dApp)
    this.signClient.on(
      "session_proposal",
      async (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
        console.log("WalletConnect: Session proposal received", proposal)
        console.log("WalletConnect: Proposal ID:", proposal.params.id)
        console.log(
          "WalletConnect: Proposal proposer:",
          proposal.params.proposer.metadata.name,
        )

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
        console.log("WalletConnect: Session request received", request)
        console.log("WalletConnect: Request topic:", request.topic)
        console.log("WalletConnect: Request ID:", request.id)
        console.log(
          "WalletConnect: Request method:",
          request.params.request.method,
        )
        console.log(
          "WalletConnect: Request params:",
          request.params.request.params,
        )

        // Check all sessions in SignClient storage
        if (this.signClient) {
          const allSessions = this.signClient.session.getAll()
          console.log(
            "WalletConnect: All sessions in SignClient:",
            allSessions.length,
          )
          allSessions.forEach((s: SessionTypes.Struct) => {
            console.log("WalletConnect: Session:", {
              topic: s.topic,
              acknowledged: s.acknowledged,
              matches: s.topic === request.topic,
            })
          })
        }

        // Verify session exists
        const session = this.activeSessions.get(request.topic)
        if (!session) {
          console.error(
            "WalletConnect: No active session found for topic:",
            request.topic,
          )
          console.error(
            "WalletConnect: Available topics in activeSessions:",
            Array.from(this.activeSessions.keys()),
          )

          // Try to find in SignClient storage
          if (this.signClient) {
            const allSessions = this.signClient.session.getAll()
            const foundSession = allSessions.find(
              (s: SessionTypes.Struct) => s.topic === request.topic,
            )
            if (foundSession) {
              console.log(
                "WalletConnect: Found session in SignClient storage but not in activeSessions",
              )
              console.log(
                "WalletConnect: Session acknowledged:",
                foundSession.acknowledged,
              )
              if (!foundSession.acknowledged) {
                console.error(
                  "WalletConnect: Session exists but is NOT acknowledged! This means proposal was not approved.",
                )
              }
              // Add to activeSessions
              this.activeSessions.set(foundSession.topic, foundSession)
            } else {
              console.error(
                "WalletConnect: Session not found in SignClient storage either!",
              )
            }
          }
        } else {
          console.log("WalletConnect: Found session for topic:", session.topic)
          console.log(
            "WalletConnect: Session acknowledged:",
            session.acknowledged,
          )
        }

        // Store request for retrieval
        this.pendingRequests.set(request.id, request)

        // Emit custom event for UI to handle
        if (typeof window !== "undefined") {
          console.log("WalletConnect: Emitting walletconnect:request event")
          window.dispatchEvent(
            new CustomEvent("walletconnect:request", { detail: request }),
          )
        } else {
          console.error("WalletConnect: window is undefined, cannot emit event")
        }
      },
    )

    // Handle session deletion (disconnection)
    this.signClient.on(
      "session_delete",
      (event: SignClientTypes.EventArguments["session_delete"]) => {
        console.log("WalletConnect: Session deleted", event)
        this.activeSessions.delete(event.topic)
      },
    )

    // Handle session expiration
    this.signClient.on(
      "session_expire",
      (event: SignClientTypes.EventArguments["session_expire"]) => {
        console.log("WalletConnect: Session expired", event)
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
      console.log("WalletConnect: Loaded session:", {
        topic: session.topic,
        peer: session.peer.metadata.name,
        namespaces: Object.keys(session.namespaces),
        expiry: session.expiry,
        acknowledged: session.acknowledged,
      })
    })

    console.log(`Loaded ${sessions.length} existing WalletConnect sessions`)
    console.log(
      "WalletConnect: Active session topics:",
      Array.from(this.activeSessions.keys()),
    )

    // Log all session topics for debugging
    if (sessions.length > 0) {
      console.log(
        "WalletConnect: All session topics:",
        sessions.map((s) => s.topic),
      )
    }
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

      console.log("WalletConnect: Session approved", session)
      console.log("WalletConnect: Session topic:", session.topic)
      console.log(
        "WalletConnect: Session namespaces:",
        Object.keys(session.namespaces),
      )
      console.log("WalletConnect: Session peer:", session.peer.metadata.name)
      console.log(
        "WalletConnect: Active sessions count:",
        this.activeSessions.size,
      )
      console.log(
        "WalletConnect: Active session topics:",
        Array.from(this.activeSessions.keys()),
      )

      // Verify session is in SignClient storage
      if (this.signClient) {
        const allSessions = this.signClient.session.getAll()
        console.log(
          "WalletConnect: SignClient sessions after approve:",
          allSessions.length,
        )
        const foundSession = allSessions.find((s) => s.topic === session.topic)
        if (foundSession) {
          console.log("WalletConnect: Session confirmed in SignClient storage")
        } else {
          console.error(
            "WalletConnect: Session NOT found in SignClient storage!",
          )
        }
      }

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
      console.log("WalletConnect: Session rejected")
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
    const sessions = Array.from(this.activeSessions.values())
    console.log(
      "WalletConnect: getActiveSessions called, returning",
      sessions.length,
      "sessions",
    )
    if (this.signClient) {
      const allSessions = this.signClient.session.getAll()
      console.log(
        "WalletConnect: SignClient has",
        allSessions.length,
        "sessions in storage",
      )
      // Sync with SignClient storage
      allSessions.forEach((session: SessionTypes.Struct) => {
        if (!this.activeSessions.has(session.topic)) {
          console.log(
            "WalletConnect: Found session in storage not in activeSessions, adding:",
            session.topic,
          )
          this.activeSessions.set(session.topic, session)
        }
      })

      // Log all session topics for debugging
      console.log(
        "WalletConnect: All session topics:",
        allSessions.map((s) => ({
          topic: s.topic,
          peer: s.peer.metadata.name,
          expiry: s.expiry,
          acknowledged: s.acknowledged,
        })),
      )
    }
    return Array.from(this.activeSessions.values())
  }

  /**
   * Check if a session with specific topic exists
   */
  hasSession(topic: string): boolean {
    if (!this.signClient) return false

    const allSessions = this.signClient.session.getAll()
    const hasSession = allSessions.some((s) => s.topic === topic)
    console.log(
      `WalletConnect: Checking session with topic ${topic}:`,
      hasSession ? "FOUND" : "NOT FOUND",
    )
    if (!hasSession) {
      console.log(
        "WalletConnect: Available topics:",
        allSessions.map((s) => s.topic),
      )
    }
    return hasSession
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
      console.log("WalletConnect: Session disconnected")
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
      console.log("WalletConnect: Paired via URI")
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
    console.log("WalletConnect: Cleaned up")
  }
}

// Singleton instance
export const walletConnectService = new WalletConnectService()

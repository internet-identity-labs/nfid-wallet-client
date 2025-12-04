import { useEffect, useState, useRef, useCallback } from "react"
import { ImSpinner } from "react-icons/im"

import { Button } from "@nfid-frontend/ui"
import { EthereumProvider } from "@walletconnect/ethereum-provider"

// WalletConnect Project ID
const PROJECT_ID = "951ec7b9914a35c2f62e2514c408ab8f"

export const WalletConnectExample = ({
  onError,
  onResponse,
  testMethod,
  isConnected: externalIsConnected,
}: {
  onError: (error: { error: string }) => void
  onResponse?: (data: any) => void
  testMethod?:
    | "connect"
    | "personal_sign"
    | "eth_sign"
    | "eth_signTransaction"
    | "eth_sendTransaction"
  isConnected?: boolean
}) => {
  const [provider, setProvider] = useState<InstanceType<
    typeof EthereumProvider
  > | null>(null)
  const [accounts, setAccounts] = useState<string[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionUri, setConnectionUri] = useState<string | null>(null)
  const [toAddress, setToAddress] = useState<string>(
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  )
  const [txValue, setTxValue] = useState<string>("0x0")
  const [txGas, setTxGas] = useState<string>("0x5208")
  const [txGasPrice, setTxGasPrice] = useState<string>("0x3b9aca00")
  const [txNonce, setTxNonce] = useState<string>("")
  const [txData, setTxData] = useState<string>("0x")
  const [txChainId, setTxChainId] = useState<string>("1")
  const [messageToSign, setMessageToSign] = useState<string>(
    "Hello from WalletConnect Test dApp!",
  )
  const [showMessageInput, setShowMessageInput] = useState<boolean>(false)
  const [pendingRequest, setPendingRequest] = useState<{
    method: string
    params: any[]
  } | null>(null)
  const providerRef = useRef<InstanceType<typeof EthereumProvider> | null>(null)

  // Memoize onError callback to avoid unnecessary re-renders
  const handleError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage)
      onError({ error: errorMessage })
    },
    [onError],
  )

  // Initialize provider - use shared provider if available
  useEffect(() => {
    const initProvider = async () => {
      try {
        // Check if there's a shared provider already initialized
        const sharedProviderKey = "walletconnect_shared_provider"
        let ethProvider: InstanceType<typeof EthereumProvider>

        if ((window as any)[sharedProviderKey]) {
          // Use existing provider
          ethProvider = (window as any)[sharedProviderKey]
          console.log("Using existing WalletConnect provider")
          console.log("Shared provider state:", {
            connected: ethProvider.connected,
            hasSession: !!ethProvider.session,
            accounts: ethProvider.accounts,
            accountsLength: ethProvider.accounts?.length || 0,
          })

          // Update accounts if already connected
          console.log("Shared provider details:", {
            connected: ethProvider.connected,
            hasSession: !!ethProvider.session,
            accounts: ethProvider.accounts,
            accountsLength: ethProvider.accounts?.length || 0,
            sessionTopic: ethProvider.session?.topic,
            sessionNamespaces: ethProvider.session?.namespaces
              ? Object.keys(ethProvider.session.namespaces)
              : [],
          })

          if (
            ethProvider.connected &&
            ethProvider.accounts &&
            ethProvider.accounts.length > 0
          ) {
            setAccounts(ethProvider.accounts)
            console.log(
              "Shared provider already connected, accounts:",
              ethProvider.accounts,
            )
          } else if (ethProvider.session && ethProvider.session.namespaces) {
            // Try to get accounts from session namespaces
            const eip155Namespace = ethProvider.session.namespaces.eip155
            if (eip155Namespace && eip155Namespace.accounts) {
              const sessionAccounts = eip155Namespace.accounts
              console.log(
                "Found accounts in session namespaces:",
                sessionAccounts,
              )
              if (
                Array.isArray(sessionAccounts) &&
                sessionAccounts.length > 0
              ) {
                // Extract Ethereum addresses from session accounts (format: eip155:1:0x...)
                const ethAccounts = sessionAccounts
                  .filter((acc: string) => acc.startsWith("eip155:"))
                  .map((acc: string) => {
                    const parts = acc.split(":")
                    return parts[2] // Extract address part
                  })
                if (ethAccounts.length > 0) {
                  setAccounts(ethAccounts)
                  localStorage.setItem(
                    "walletconnect_accounts",
                    JSON.stringify(ethAccounts),
                  )
                  console.log(
                    "Restored accounts from session namespaces:",
                    ethAccounts,
                  )
                } else {
                  console.warn(
                    "No valid Ethereum addresses extracted from session accounts",
                  )
                }
              } else {
                console.warn("Session accounts is not an array or is empty")
              }
            } else {
              console.warn("No eip155 namespace or accounts in session")
            }
          } else {
            // Check localStorage as fallback
            const savedAccounts = localStorage.getItem("walletconnect_accounts")
            if (savedAccounts) {
              try {
                const accounts = JSON.parse(savedAccounts)
                if (Array.isArray(accounts) && accounts.length > 0) {
                  setAccounts(accounts)
                  console.log("Restored accounts from localStorage:", accounts)
                }
              } catch (e) {
                console.error("Failed to parse saved accounts:", e)
              }
            } else {
              console.warn(
                "No accounts found in provider, session, or localStorage",
              )
            }
          }
        } else {
          // Create new provider
          ethProvider = await EthereumProvider.init({
            projectId: PROJECT_ID,
            chains: [1], // Ethereum Mainnet
            showQrModal: false, // Disable modal to show QR code manually
            metadata: {
              name: "WalletConnect Test dApp",
              description: "Test dApp for NFID Wallet",
              url: window.location.origin,
              icons: ["https://nfid.one/assets/nfid-wallet-og.png"],
            },
          })

          // Store provider globally for reuse
          ;(window as any)[sharedProviderKey] = ethProvider
        }

        // Setup event listeners
        ethProvider.on("display_uri", (uri: string) => {
          console.log("WalletConnect URI:", uri)
          setConnectionUri(uri)
        })

        ethProvider.on("connect", () => {
          console.log("Connected to wallet")
          console.log("Provider accounts on connect:", ethProvider.accounts)
          console.log("Provider session on connect:", ethProvider.session)
          setError(null)

          // First try provider.accounts
          if (ethProvider.accounts && ethProvider.accounts.length > 0) {
            setAccounts(ethProvider.accounts)
            console.log(
              "Set accounts from connect event (provider.accounts):",
              ethProvider.accounts,
            )
            localStorage.setItem(
              "walletconnect_accounts",
              JSON.stringify(ethProvider.accounts),
            )
            return
          }

          // Then try session namespaces
          if (ethProvider.session && ethProvider.session.namespaces) {
            const eip155Namespace = ethProvider.session.namespaces.eip155
            if (eip155Namespace && eip155Namespace.accounts) {
              const sessionAccounts = eip155Namespace.accounts
              console.log(
                "Found accounts in session namespaces:",
                sessionAccounts,
              )
              const ethAccounts = sessionAccounts
                .filter((acc: string) => acc.startsWith("eip155:"))
                .map((acc: string) => {
                  // Format: eip155:chainId:address
                  const parts = acc.split(":")
                  return parts[2] // Extract address
                })
              if (ethAccounts.length > 0) {
                setAccounts(ethAccounts)
                localStorage.setItem(
                  "walletconnect_accounts",
                  JSON.stringify(ethAccounts),
                )
                console.log(
                  "Set accounts from session namespaces on connect:",
                  ethAccounts,
                )
                return
              }
            }
          }

          // Fallback to localStorage
          const savedAccounts = localStorage.getItem("walletconnect_accounts")
          if (savedAccounts) {
            try {
              const accounts = JSON.parse(savedAccounts)
              if (Array.isArray(accounts) && accounts.length > 0) {
                setAccounts(accounts)
                console.log(
                  "Set accounts from localStorage on connect:",
                  accounts,
                )
              }
            } catch (e) {
              console.error("Failed to parse saved accounts:", e)
            }
          }
        })

        ethProvider.on("disconnect", () => {
          console.log("Disconnected from wallet")
          setAccounts([])
          localStorage.removeItem("walletconnect_connected")
          localStorage.removeItem("walletconnect_accounts")
          window.dispatchEvent(new CustomEvent("walletconnect:disconnected"))
        })

        ethProvider.on("accountsChanged", (newAccounts: string[]) => {
          console.log("Accounts changed:", newAccounts)
          if (newAccounts && newAccounts.length > 0) {
            setAccounts(newAccounts)
            localStorage.setItem(
              "walletconnect_accounts",
              JSON.stringify(newAccounts),
            )
            console.log(
              "Updated accounts from accountsChanged event:",
              newAccounts,
            )
          }
        })

        ethProvider.on("chainChanged", (chainId: string) => {
          console.log("Chain changed:", chainId)
        })

        setProvider(ethProvider)
        providerRef.current = ethProvider

        // Check if already connected and restore accounts
        if (ethProvider.connected && ethProvider.session) {
          console.log("Provider already connected on init, restoring accounts")
          console.log("Provider state:", {
            connected: ethProvider.connected,
            hasSession: !!ethProvider.session,
            accounts: ethProvider.accounts,
            sessionTopic: ethProvider.session.topic,
            sessionNamespaces: ethProvider.session.namespaces
              ? Object.keys(ethProvider.session.namespaces)
              : [],
          })

          // Try to get accounts immediately
          if (ethProvider.accounts && ethProvider.accounts.length > 0) {
            setAccounts(ethProvider.accounts)
            console.log(
              "Restored accounts from provider.accounts:",
              ethProvider.accounts,
            )
          } else if (ethProvider.session.namespaces?.eip155?.accounts) {
            const sessionAccounts =
              ethProvider.session.namespaces.eip155.accounts
            console.log(
              "Found accounts in session namespaces:",
              sessionAccounts,
            )
            const ethAccounts = sessionAccounts
              .filter((acc: string) => acc.startsWith("eip155:"))
              .map((acc: string) => {
                const parts = acc.split(":")
                return parts[2] // Extract address
              })
            if (ethAccounts.length > 0) {
              setAccounts(ethAccounts)
              localStorage.setItem(
                "walletconnect_accounts",
                JSON.stringify(ethAccounts),
              )
              console.log(
                "Restored accounts from session on init:",
                ethAccounts,
              )
            } else {
              console.warn(
                "No valid Ethereum accounts found in session namespaces",
              )
            }
          } else {
            console.warn("No accounts found in provider or session namespaces")
            // Try localStorage as last resort
            const savedAccounts = localStorage.getItem("walletconnect_accounts")
            if (savedAccounts) {
              try {
                const accounts = JSON.parse(savedAccounts)
                if (Array.isArray(accounts) && accounts.length > 0) {
                  setAccounts(accounts)
                  console.log(
                    "Restored accounts from localStorage on init:",
                    accounts,
                  )
                }
              } catch (e) {
                console.error("Failed to parse saved accounts:", e)
              }
            }
          }
        } else {
          console.log("Provider not connected on init:", {
            connected: ethProvider.connected,
            hasSession: !!ethProvider.session,
          })
        }
      } catch (err) {
        console.error("Failed to initialize provider:", err)
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize provider"
        handleError(errorMessage)
      }
    }

    initProvider()

    // Don't cleanup provider on unmount - keep it for other sections
    // Only cleanup if this is the connect section
    return () => {
      // Only cleanup if testMethod is "connect" (the main connection section)
      if (testMethod === "connect" && providerRef.current) {
        // Don't disconnect, just clear the ref
        providerRef.current = null
      }
    }
  }, [handleError, testMethod])

  useEffect(() => {
    if (error) {
      onError({ error })
    }
  }, [error, onError])

  const handleConnect = async () => {
    if (!provider) {
      const errorMsg = "Provider not initialized"
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    try {
      setIsConnecting(true)
      setError(null)
      setConnectionUri(null) // Clear previous URI

      // This will trigger display_uri event
      const connectedAccounts = await provider.enable()
      setAccounts(connectedAccounts)
      console.log("Connected accounts:", connectedAccounts)
      console.log("Provider session after enable:", {
        hasSession: !!provider.session,
        topic: provider.session?.topic,
        connected: provider.connected,
        namespaces: provider.session
          ? Object.keys(provider.session.namespaces || {})
          : [],
      })

      // Update response
      if (onResponse) {
        onResponse({
          accounts: connectedAccounts,
          chainId: 1,
          connected: true,
        })
      }
    } catch (err) {
      console.error("Connection error:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to wallet"
      setError(errorMessage)
      onError({ error: errorMessage })
    } finally {
      setIsConnecting(false)
    }
  }

  const copyCommand = () => {
    if (connectionUri) {
      const command = `window.walletConnectService.connectViaUri('${connectionUri}')`
      navigator.clipboard.writeText(command)
    }
  }

  const handlePersonalSignClick = () => {
    if (!isConnected) {
      const errorMsg = "Please connect wallet first"
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }
    setShowMessageInput(true)
  }

  const handlePersonalSign = async () => {
    console.log("handlePersonalSign called", {
      provider: !!provider,
      accounts,
      accountsLength: accounts.length,
      providerConnected: provider?.connected,
      hasSession: !!provider?.session,
      providerAccounts: provider?.accounts,
    })

    if (!provider) {
      const errorMsg = "Provider not initialized"
      console.error("handlePersonalSign: Provider not initialized")
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    // Check if provider has valid session
    if (!provider.session) {
      console.warn(
        "handlePersonalSign: Provider has no session, attempting to reconnect",
      )
      try {
        // Try to reconnect
        const connectedAccounts = await provider.enable()
        if (connectedAccounts && connectedAccounts.length > 0) {
          setAccounts(connectedAccounts)
          console.log(
            "handlePersonalSign: Reconnected and got accounts:",
            connectedAccounts,
          )
        } else {
          const errorMsg =
            "Please connect wallet first. No active session found."
          console.error("handlePersonalSign: No session and reconnect failed", {
            provider: !!provider,
            connected: provider.connected,
            hasSession: !!provider.session,
          })
          setError(errorMsg)
          onError({ error: errorMsg })
          return
        }
      } catch (reconnectError) {
        const errorMsg = "Please connect wallet first. Failed to reconnect."
        console.error("handlePersonalSign: Reconnect failed", reconnectError)
        setError(errorMsg)
        onError({ error: errorMsg })
        return
      }
    }

    // Try to restore accounts if provider is connected but accounts are empty
    if (provider.connected && provider.session && accounts.length === 0) {
      console.log(
        "handlePersonalSign: Provider connected but accounts empty, trying to restore",
      )

      // Try provider.accounts first
      if (provider.accounts && provider.accounts.length > 0) {
        setAccounts(provider.accounts)
        console.log(
          "handlePersonalSign: Restored accounts from provider.accounts:",
          provider.accounts,
        )
      }
      // Try session namespaces
      else if (provider.session.namespaces?.eip155?.accounts) {
        const sessionAccounts = provider.session.namespaces.eip155.accounts
        const ethAccounts = sessionAccounts
          .filter((acc: string) => acc.startsWith("eip155:"))
          .map((acc: string) => acc.split(":")[2])
        if (ethAccounts.length > 0) {
          setAccounts(ethAccounts)
          console.log(
            "handlePersonalSign: Restored accounts from session:",
            ethAccounts,
          )
        }
      }
      // Try localStorage
      else {
        const savedAccounts = localStorage.getItem("walletconnect_accounts")
        if (savedAccounts) {
          try {
            const accounts = JSON.parse(savedAccounts)
            if (Array.isArray(accounts) && accounts.length > 0) {
              setAccounts(accounts)
              console.log(
                "handlePersonalSign: Restored accounts from localStorage:",
                accounts,
              )
            }
          } catch (e) {
            console.error(
              "handlePersonalSign: Failed to parse saved accounts:",
              e,
            )
          }
        }
      }
    }

    // Check again after restoration attempt
    if (accounts.length === 0 && (!provider.connected || !provider.session)) {
      const errorMsg = "Please connect wallet first"
      console.error("handlePersonalSign: Not ready after restoration attempt", {
        provider: !!provider,
        accounts,
        providerConnected: provider?.connected,
        hasSession: !!provider?.session,
      })
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    // Use accounts from provider if local accounts are still empty but provider has them
    const accountsToUse =
      accounts.length > 0 ? accounts : provider.accounts || []
    if (accountsToUse.length === 0) {
      const errorMsg = "No accounts available. Please connect wallet first."
      console.error("handlePersonalSign: No accounts available", {
        localAccounts: accounts,
        providerAccounts: provider.accounts,
        hasSession: !!provider.session,
      })
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    if (!messageToSign.trim()) {
      const errorMsg = "Please enter a message to sign"
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    try {
      setError(null)

      // Ensure provider is connected before making requests
      // Check if provider has an active session
      if (!provider.session || !provider.connected) {
        console.log("Provider not connected, reconnecting...", {
          hasSession: !!provider.session,
          connected: provider.connected,
        })
        // Re-enable connection - this will trigger a new connection request
        const connectedAccounts = await provider.enable()
        setAccounts(connectedAccounts)

        // Update connection state
        if (onResponse) {
          onResponse({
            accounts: connectedAccounts,
            chainId: 1,
            connected: true,
          })
        }
      } else {
        console.log("Provider already connected, using existing session")
      }

      const message = messageToSign
      const address = accountsToUse[0]

      console.log("handlePersonalSign: Sending request", {
        method: "personal_sign",
        message,
        address,
        session: !!provider.session,
        sessionTopic: provider.session?.topic,
        connected: provider.connected,
        accounts: accounts,
      })

      // Store pending request info
      const requestParams = [message, address]
      setPendingRequest({ method: "personal_sign", params: requestParams })

      // Log session details for debugging
      if (provider.session) {
        console.log("handlePersonalSign: Provider session details:", {
          topic: provider.session.topic,
          namespaces: Object.keys(provider.session.namespaces || {}),
          peer: provider.session.peer?.metadata?.name,
        })
      } else {
        console.error("handlePersonalSign: No session found in provider!")
      }

      const signature = await provider.request({
        method: "personal_sign",
        params: requestParams,
      })

      console.log("personal_sign signature:", signature)

      // Clear pending request
      setPendingRequest(null)

      // Update response
      if (onResponse) {
        onResponse({
          method: "personal_sign",
          signature,
          message,
          address,
        })
      }

      setShowMessageInput(false)
      alert(`Message signed successfully!\n\nSignature: ${signature}`)
    } catch (err) {
      console.error("personal_sign error:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign message"
      setError(errorMessage)
      onError({ error: errorMessage })
    }
  }

  const handleEthSign = async () => {
    if (!provider) {
      const errorMsg = "Provider not initialized"
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    // Check if provider has valid session
    if (!provider.session) {
      try {
        const connectedAccounts = await provider.enable()
        if (connectedAccounts && connectedAccounts.length > 0) {
          setAccounts(connectedAccounts)
        } else {
          const errorMsg =
            "Please connect wallet first. No active session found."
          setError(errorMsg)
          onError({ error: errorMsg })
          return
        }
      } catch (reconnectError) {
        const errorMsg = "Please connect wallet first. Failed to reconnect."
        setError(errorMsg)
        onError({ error: errorMsg })
        return
      }
    }

    // Try to restore accounts if provider is connected but accounts are empty
    if (provider.connected && provider.session && accounts.length === 0) {
      if (provider.accounts && provider.accounts.length > 0) {
        setAccounts(provider.accounts)
      } else if (provider.session.namespaces?.eip155?.accounts) {
        const sessionAccounts = provider.session.namespaces.eip155.accounts
        const ethAccounts = sessionAccounts
          .filter((acc: string) => acc.startsWith("eip155:"))
          .map((acc: string) => acc.split(":")[2])
        if (ethAccounts.length > 0) {
          setAccounts(ethAccounts)
        }
      } else {
        const savedAccounts = localStorage.getItem("walletconnect_accounts")
        if (savedAccounts) {
          try {
            const accounts = JSON.parse(savedAccounts)
            if (Array.isArray(accounts) && accounts.length > 0) {
              setAccounts(accounts)
            }
          } catch (e) {
            console.error("Failed to parse saved accounts:", e)
          }
        }
      }
    }

    // Use accounts from provider if local accounts are still empty but provider has them
    const accountsToUse =
      accounts.length > 0 ? accounts : provider.accounts || []
    if (accountsToUse.length === 0) {
      const errorMsg = "No accounts available. Please connect wallet first."
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    try {
      setError(null)

      // Ensure provider is connected before making requests
      if (!provider.session || !provider.connected) {
        await provider.enable()
      }

      const address = accountsToUse[0]
      // Create a 32-byte hash to sign (eth_sign expects a 32-byte hash)
      // For testing, we'll use a simple hash. In production, use keccak256 or similar
      const message = "Hello from WalletConnect Test dApp!"
      // Create a 32-byte hash (64 hex characters)
      const messageBytes = Buffer.from(message)
      const hash = `0x${messageBytes.toString("hex").padEnd(64, "0").slice(0, 64)}`

      const signature = await provider.request({
        method: "eth_sign",
        params: [address, hash],
      })

      console.log("eth_sign signature:", signature)

      // Update response
      if (onResponse) {
        onResponse({
          method: "eth_sign",
          signature,
          address,
          hash: hash,
        })
      }

      alert(
        `Hash signed successfully!\n\nHash: ${hash}\nSignature: ${signature}`,
      )
    } catch (err) {
      console.error("eth_sign error:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign hash"
      setError(errorMessage)
      onError({ error: errorMessage })
    }
  }

  const handleSignTransaction = async () => {
    if (!provider) {
      const errorMsg = "Provider not initialized"
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    // Check if provider has valid session
    if (!provider.session) {
      try {
        const connectedAccounts = await provider.enable()
        if (connectedAccounts && connectedAccounts.length > 0) {
          setAccounts(connectedAccounts)
        } else {
          const errorMsg =
            "Please connect wallet first. No active session found."
          setError(errorMsg)
          onError({ error: errorMsg })
          return
        }
      } catch (reconnectError) {
        const errorMsg = "Please connect wallet first. Failed to reconnect."
        setError(errorMsg)
        onError({ error: errorMsg })
        return
      }
    }

    // Try to restore accounts if provider is connected but accounts are empty
    if (provider.connected && provider.session && accounts.length === 0) {
      if (provider.accounts && provider.accounts.length > 0) {
        debugger
        setAccounts(provider.accounts)
      } else if (provider.session.namespaces?.eip155?.accounts) {
        const sessionAccounts = provider.session.namespaces.eip155.accounts
        const ethAccounts = sessionAccounts
          .filter((acc: string) => acc.startsWith("eip155:"))
          .map((acc: string) => acc.split(":")[2])
        if (ethAccounts.length > 0) {
          setAccounts(ethAccounts)
        }
      } else {
        const savedAccounts = localStorage.getItem("walletconnect_accounts")
        if (savedAccounts) {
          try {
            const accounts = JSON.parse(savedAccounts)
            if (Array.isArray(accounts) && accounts.length > 0) {
              setAccounts(accounts)
            }
          } catch (e) {
            console.error("Failed to parse saved accounts:", e)
          }
        }
      }
    }

    // Use accounts from provider if local accounts are still empty but provider has them
    const accountsToUse =
      accounts.length > 0 ? accounts : provider.accounts || []
    if (accountsToUse.length === 0) {
      const errorMsg = "No accounts available. Please connect wallet first."
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    try {
      setError(null)

      // Ensure provider is connected before making requests
      if (!provider.session || !provider.connected) {
        await provider.enable()
      }

      // Get active account from provider session - MUST be from WalletConnect session
      // WalletConnect validates that 'from' address matches exactly one of the approved accounts
      let address: string

      // ALWAYS use address from session namespaces first (most reliable)
      const sessionAccounts =
        provider.session?.namespaces?.eip155?.accounts || []
      if (sessionAccounts.length > 0) {
        // Extract address from session namespace (format: eip155:1:0x...)
        const ethAccount = sessionAccounts.find((acc: string) =>
          acc.startsWith("eip155:"),
        )
        if (ethAccount) {
          address = ethAccount.split(":")[2] // Extract address part (0x...)
          // Ensure address has 0x prefix, but keep original case (WalletConnect may be case-sensitive)
          if (!address.startsWith("0x")) {
            address = `0x${address}`
          }
          // Don't convert to lowercase - use address exactly as it appears in session
        } else {
          throw new Error("No Ethereum account found in WalletConnect session")
        }
      } else if (provider.accounts && provider.accounts.length > 0) {
        // Fallback to provider.accounts
        address = provider.accounts[0]
        if (!address.startsWith("0x")) {
          address = `0x${address}`
        }
        // Don't convert to lowercase - use address exactly as it appears
      } else if (accountsToUse.length > 0) {
        // Last resort: local accounts
        address = accountsToUse[0]
        if (!address.startsWith("0x")) {
          address = `0x${address}`
        }
        // Don't convert to lowercase - use address exactly as it appears
      } else {
        throw new Error("No account available. Please connect wallet first.")
      }

      console.log("Using address for eth_signTransaction:", address, {
        sessionAccounts: provider.session?.namespaces?.eip155?.accounts,
        providerAccounts: provider.accounts,
        localAccounts: accountsToUse,
        finalAddress: address,
      })

      // Validate to address
      const recipientAddress =
        toAddress || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      if (
        !recipientAddress.startsWith("0x") ||
        recipientAddress.length !== 42
      ) {
        throw new Error(
          "Invalid recipient address. Please enter a valid Ethereum address (0x...)",
        )
      }

      // Create a test transaction (not sending, just signing)
      // Convert chainId to hex string if it's a number
      const chainIdValue = txChainId || "1"
      const chainIdHex = chainIdValue.startsWith("0x")
        ? chainIdValue
        : `0x${parseInt(chainIdValue, 10).toString(16)}`

      // Convert nonce to hex string if provided, otherwise use default "0x1"
      const nonceValue = txNonce || "1"
      const nonceHex = nonceValue.startsWith("0x")
        ? nonceValue
        : `0x${parseInt(nonceValue, 10).toString(16)}`

      const transaction = {
        from: address,
        to: recipientAddress,
        value: txValue || "0x0",
        gas: txGas || "0x5208",
        gasPrice: txGasPrice || "0x3b9aca00",
        nonce: nonceHex,
        data: txData || "0x",
        chainId: chainIdHex,
      }

      debugger

      const signature = await provider.request({
        method: "eth_signTransaction",
        params: [transaction],
      })

      console.log("eth_signTransaction signature:", signature)

      // Update response
      if (onResponse) {
        onResponse({
          method: "eth_signTransaction",
          signature,
          transaction,
        })
      }

      alert(`Transaction signed successfully!\n\nSignature: ${signature}`)
    } catch (err) {
      console.error("eth_signTransaction error:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign transaction"
      setError(errorMessage)
      onError({ error: errorMessage })
    }
  }

  const handleSendTransaction = async () => {
    if (!provider) {
      const errorMsg = "Provider not initialized"
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    // Check if provider has valid session
    if (!provider.session) {
      try {
        const connectedAccounts = await provider.enable()
        if (connectedAccounts && connectedAccounts.length > 0) {
          setAccounts(connectedAccounts)
        } else {
          const errorMsg =
            "Please connect wallet first. No active session found."
          setError(errorMsg)
          onError({ error: errorMsg })
          return
        }
      } catch (reconnectError) {
        const errorMsg = "Please connect wallet first. Failed to reconnect."
        setError(errorMsg)
        onError({ error: errorMsg })
        return
      }
    }

    // Try to restore accounts if provider is connected but accounts are empty
    if (provider.connected && provider.session && accounts.length === 0) {
      if (provider.accounts && provider.accounts.length > 0) {
        setAccounts(provider.accounts)
      } else if (provider.session.namespaces?.eip155?.accounts) {
        const sessionAccounts = provider.session.namespaces.eip155.accounts
        const ethAccounts = sessionAccounts
          .filter((acc: string) => acc.startsWith("eip155:"))
          .map((acc: string) => acc.split(":")[2])
        if (ethAccounts.length > 0) {
          setAccounts(ethAccounts)
        }
      } else {
        const savedAccounts = localStorage.getItem("walletconnect_accounts")
        if (savedAccounts) {
          try {
            const accounts = JSON.parse(savedAccounts)
            if (Array.isArray(accounts) && accounts.length > 0) {
              setAccounts(accounts)
            }
          } catch (e) {
            console.error("Failed to parse saved accounts:", e)
          }
        }
      }
    }

    // Use accounts from provider if local accounts are still empty but provider has them
    const accountsToUse =
      accounts.length > 0 ? accounts : provider.accounts || []
    if (accountsToUse.length === 0) {
      const errorMsg = "No accounts available. Please connect wallet first."
      setError(errorMsg)
      onError({ error: errorMsg })
      return
    }

    try {
      setError(null)
      debugger

      // Ensure provider is connected before making requests
      if (!provider.session || !provider.connected) {
        await provider.enable()
      }

      // Get active account from provider session - MUST be from WalletConnect session
      // WalletConnect validates that 'from' address matches exactly one of the approved accounts
      let address: string

      // ALWAYS use address from session namespaces first (most reliable)
      const sessionAccounts =
        provider.session?.namespaces?.eip155?.accounts || []
      if (sessionAccounts.length > 0) {
        // Extract address from session namespace (format: eip155:1:0x...)
        const ethAccount = sessionAccounts.find((acc: string) =>
          acc.startsWith("eip155:"),
        )
        if (ethAccount) {
          address = ethAccount.split(":")[2] // Extract address part (0x...)
          // Ensure address has 0x prefix, but keep original case (WalletConnect may be case-sensitive)
          if (!address.startsWith("0x")) {
            address = `0x${address}`
          }
          // Don't convert to lowercase - use address exactly as it appears in session
        } else {
          throw new Error("No Ethereum account found in WalletConnect session")
        }
      } else if (provider.accounts && provider.accounts.length > 0) {
        // Fallback to provider.accounts
        address = provider.accounts[0]
        if (!address.startsWith("0x")) {
          address = `0x${address}`
        }
        // Don't convert to lowercase - use address exactly as it appears
      } else if (accountsToUse.length > 0) {
        // Last resort: local accounts
        address = accountsToUse[0]
        if (!address.startsWith("0x")) {
          address = `0x${address}`
        }
        // Don't convert to lowercase - use address exactly as it appears
      } else {
        throw new Error("No account available. Please connect wallet first.")
      }

      console.log("Using address for eth_sendTransaction:", address, {
        sessionAccounts: provider.session?.namespaces?.eip155?.accounts,
        providerAccounts: provider.accounts,
        localAccounts: accountsToUse,
        finalAddress: address,
      })

      // Validate to address
      const recipientAddress =
        toAddress || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      if (
        !recipientAddress.startsWith("0x") ||
        recipientAddress.length !== 42
      ) {
        throw new Error(
          "Invalid recipient address. Please enter a valid Ethereum address (0x...)",
        )
      }

      // Create a test transaction (will be sent to network)
      // WARNING: This will actually send a transaction!
      // Convert chainId to hex string if it's a number
      const chainIdValue = txChainId || "1"
      const chainIdHex = chainIdValue.startsWith("0x")
        ? chainIdValue
        : `0x${parseInt(chainIdValue, 10).toString(16)}`

      // Convert nonce to hex string if provided, otherwise use default "0x1"
      const nonceValue = txNonce || "1"
      const nonceHex = nonceValue.startsWith("0x")
        ? nonceValue
        : `0x${parseInt(nonceValue, 10).toString(16)}`

      const transaction = {
        from: address,
        to: recipientAddress,
        value: txValue || "0x0",
        gas: txGas || "0x5208",
        gasPrice: txGasPrice || "0x3b9aca00",
        nonce: nonceHex,
        data: txData || "0x",
        chainId: chainIdHex,
      }

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transaction],
      })

      console.log("eth_sendTransaction txHash:", txHash)

      // Update response
      if (onResponse) {
        onResponse({
          method: "eth_sendTransaction",
          txHash,
          transaction,
        })
      }

      alert(
        `Transaction sent successfully!\n\nTransaction Hash: ${txHash}\n\nNote: This is a real transaction on the network.`,
      )
    } catch (err) {
      console.error("eth_sendTransaction error:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send transaction"
      setError(errorMessage)
      onError({ error: errorMessage })
    }
  }

  const handleDisconnect = async () => {
    if (!provider) return

    try {
      await provider.disconnect()
      setAccounts([])
      setError(null)

      // Clear connection state
      localStorage.removeItem("walletconnect_connected")
      localStorage.removeItem("walletconnect_accounts")

      // Dispatch event to notify other sections
      window.dispatchEvent(new CustomEvent("walletconnect:disconnected"))
    } catch (err) {
      console.error("Disconnect error:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to disconnect"
      setError(errorMessage)
      onError({ error: errorMessage })
    }
  }

  // Use externalIsConnected if provided, otherwise check accounts
  const isConnected =
    externalIsConnected !== undefined
      ? externalIsConnected
      : accounts.length > 0 ||
        (provider?.connected && provider?.accounts?.length > 0)

  if (!provider) {
    return (
      <div className="flex items-center gap-2">
        <ImSpinner className="animate-spin" />
        <span>Initializing WalletConnect...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm">
          Status: {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Show Connect button only for connect section or when no testMethod */}
        {(testMethod === "connect" || !testMethod) && (
          <Button
            className="h-10"
            isSmall
            onClick={handleConnect}
            disabled={isConnected || isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}

        {isConnected && (
          <>
            {testMethod === "connect" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-xs">
                <p className="text-green-800 font-semibold">
                  ✓ Connected successfully!
                </p>
                <p className="text-green-700 mt-1">
                  You can now use the methods below (5.1-5.4)
                </p>
              </div>
            )}
            {!testMethod && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600">
                  Test Methods:
                </p>
                <Button
                  className="h-10 w-full"
                  isSmall
                  onClick={handlePersonalSign}
                  disabled={!isConnected}
                >
                  personal_sign
                </Button>
                <Button
                  className="h-10 w-full"
                  isSmall
                  onClick={handleEthSign}
                  disabled={!isConnected}
                >
                  eth_sign
                </Button>
                <Button
                  className="h-10 w-full"
                  isSmall
                  onClick={handleSignTransaction}
                  disabled={!isConnected}
                >
                  eth_signTransaction
                </Button>
                <Button
                  className="h-10 w-full"
                  isSmall
                  onClick={handleSendTransaction}
                  disabled={!isConnected}
                >
                  eth_sendTransaction (⚠️ Real TX)
                </Button>
              </div>
            )}
            {testMethod === "personal_sign" && (
              <>
                {!showMessageInput ? (
                  <Button
                    className="h-10 w-full"
                    isSmall
                    onClick={handlePersonalSignClick}
                    disabled={
                      !isConnected ||
                      (externalIsConnected !== undefined &&
                        !externalIsConnected)
                    }
                  >
                    Sign Message
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Message to sign:
                    </label>
                    <textarea
                      value={messageToSign}
                      onChange={(e) => setMessageToSign(e.target.value)}
                      placeholder="Enter message to sign"
                      className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        className="h-10 flex-1"
                        isSmall
                        onClick={handlePersonalSign}
                        disabled={!messageToSign.trim()}
                      >
                        Sign
                      </Button>
                      <Button
                        className="h-10"
                        isSmall
                        onClick={() => {
                          setShowMessageInput(false)
                          setMessageToSign(
                            "Hello from WalletConnect Test dApp!",
                          )
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            {testMethod === "eth_sign" && (
              <Button
                className="h-10 w-full"
                isSmall
                onClick={handleEthSign}
                disabled={
                  !isConnected ||
                  (externalIsConnected !== undefined && !externalIsConnected)
                }
              >
                Sign Hash
              </Button>
            )}
            {testMethod === "eth_signTransaction" && (
              <Button
                className="h-10 w-full"
                isSmall
                onClick={handleSignTransaction}
                disabled={
                  !isConnected ||
                  (externalIsConnected !== undefined && !externalIsConnected)
                }
              >
                Sign Transaction
              </Button>
            )}
            {testMethod === "eth_sendTransaction" && (
              <Button
                className="h-10 w-full"
                isSmall
                onClick={handleSendTransaction}
                disabled={
                  !isConnected ||
                  (externalIsConnected !== undefined && !externalIsConnected)
                }
              >
                Send Transaction (⚠️ Real TX)
              </Button>
            )}
            {/* Show Disconnect only for connect section */}
            {testMethod === "connect" && (
              <Button
                className="h-10"
                isSmall
                onClick={handleDisconnect}
                disabled={!isConnected}
              >
                Disconnect
              </Button>
            )}
          </>
        )}

        {/* Show message when not connected and not in connect section */}
        {!isConnected && testMethod && testMethod !== "connect" && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs">
            <p className="text-gray-600">
              Please connect to wallet first in section 5.0
            </p>
          </div>
        )}
      </div>

      {isConnected && (
        <>
          <div className="p-3 bg-gray-50 rounded text-xs">
            <p className="font-semibold mb-1">Connected Account:</p>
            <p className="font-mono break-all text-gray-600">{accounts[0]}</p>
          </div>
          {(testMethod === "eth_signTransaction" ||
            testMethod === "eth_sendTransaction" ||
            !testMethod) && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded space-y-3">
              <p className="text-xs font-semibold text-blue-900">
                Transaction Parameters:
              </p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    From Address:
                  </label>
                  <input
                    type="text"
                    value={accounts[0] || ""}
                    disabled
                    placeholder="Connect wallet first"
                    className="w-full px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded font-mono text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    To Address:
                  </label>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Value (wei, hex):
                  </label>
                  <input
                    type="text"
                    value={txValue}
                    onChange={(e) => setTxValue(e.target.value)}
                    placeholder="0x0"
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Gas Limit (hex):
                  </label>
                  <input
                    type="text"
                    value={txGas}
                    onChange={(e) => setTxGas(e.target.value)}
                    placeholder="0x5208"
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Gas Price (wei, hex):
                  </label>
                  <input
                    type="text"
                    value={txGasPrice}
                    onChange={(e) => setTxGasPrice(e.target.value)}
                    placeholder="0x3b9aca00"
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Nonce (hex, optional):
                  </label>
                  <input
                    type="text"
                    value={txNonce}
                    onChange={(e) => setTxNonce(e.target.value)}
                    placeholder="auto"
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Data (hex):
                  </label>
                  <input
                    type="text"
                    value={txData}
                    onChange={(e) => setTxData(e.target.value)}
                    placeholder="0x"
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Chain ID:
                  </label>
                  <input
                    type="text"
                    value={txChainId}
                    onChange={(e) => setTxChainId(e.target.value)}
                    placeholder="1"
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {connectionUri && !isConnected && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <p className="text-sm font-semibold text-blue-900">
            Connect to NFID Wallet (Local Testing):
          </p>
          <div className="space-y-2">
            <p className="text-xs text-blue-700">
              In wallet console (F12), run:
            </p>
            <div className="flex gap-2">
              <code className="flex-1 px-2 py-1 text-xs bg-white border border-blue-300 rounded font-mono break-all">
                window.walletConnectService.connectViaUri('{connectionUri}')
              </code>
              <Button className="h-8" isSmall onClick={copyCommand}>
                Copy
              </Button>
            </div>
          </div>
        </div>
      )}

      {pendingRequest && testMethod === "personal_sign" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <p className="text-sm font-semibold text-blue-900">
            Sign Request Sent:
          </p>
          <div className="space-y-2">
            <p className="text-xs text-blue-700">
              Request sent via WalletConnect protocol. The wallet should
              automatically receive the request and open a confirmation window.
            </p>
            <p className="text-xs text-blue-700">
              <strong>How it works:</strong> When you click "Sign", the dApp
              sends the request through WalletConnect relay server. The wallet's
              WalletConnectService receives it via the "session_request" event
              and automatically opens /rpc/walletconnect/ for approval.
            </p>
            <p className="text-xs text-blue-700">Request details:</p>
            <div className="p-2 bg-white border border-blue-300 rounded text-xs">
              <p className="font-mono break-all">
                Method: {pendingRequest.method}
              </p>
              <p className="font-mono break-all mt-1">
                Message: {pendingRequest.params[0]}
              </p>
              <p className="font-mono break-all mt-1">
                Address: {pendingRequest.params[1]}
              </p>
            </div>
            <p className="text-xs text-blue-600 italic">
              ⚠️ If the wallet window doesn't open automatically, check:
            </p>
            <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
              <li>Wallet is running and WalletConnectService is initialized</li>
              <li>Session is still active (check wallet console for errors)</li>
              <li>No popup blockers are preventing the window from opening</li>
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          {error}
        </div>
      )}
    </div>
  )
}

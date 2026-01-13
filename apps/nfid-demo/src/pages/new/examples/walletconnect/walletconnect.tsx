import { useEffect, useState, useRef, useCallback } from "react"
import { ImSpinner } from "react-icons/im"
import { isAddress } from "ethers"

import { Button } from "@nfid/ui"
import { EthereumProvider } from "@walletconnect/ethereum-provider"
import { EthereumTransactionParams } from "frontend/features/walletconnect/types"

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
    | "eth_signTypedData_v4"
  isConnected?: boolean
}) => {
  const [provider, setProvider] = useState<InstanceType<
    typeof EthereumProvider
  > | null>(null)
  const [accounts, setAccounts] = useState<string[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionUri, setConnectionUri] = useState<string | null>(null)
  const [messageToSign, setMessageToSign] = useState<string>(
    "Hello from WalletConnect Test dApp!",
  )
  const [showMessageInput, setShowMessageInput] = useState<boolean>(false)
  const [pendingRequest, setPendingRequest] = useState<{
    method: string
    params: any[]
  } | null>(null)
  const [showTransactionInput, setShowTransactionInput] =
    useState<boolean>(false)
  const [toAddress, setToAddress] = useState<string>(
    "0xb1107f4141fb56b07d15b65f1629451443ff8f8e",
  )
  const [txValue, setTxValue] = useState<string>("0")
  const [txGas, setTxGas] = useState<string>("21000")
  const [txGasPrice, setTxGasPrice] = useState<string>("1000000000")
  const [txNonce, setTxNonce] = useState<string>("1")
  const [txData, setTxData] = useState<string>("0x")
  const [txChainId, setTxChainId] = useState<string>("1")
  const [typedData, setTypedData] = useState<string>(
    JSON.stringify(
      {
        domain: {
          name: "Example DApp",
          version: "1",
          chainId: 1,
          verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        },
        types: {
          Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" },
          ],
          Mail: [
            { name: "from", type: "Person" },
            { name: "to", type: "Person" },
            { name: "contents", type: "string" },
          ],
        },
        primaryType: "Mail",
        message: {
          from: {
            name: "Alice",
            wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
          },
          to: {
            name: "Bob",
            wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
          },
          contents: "Hello, Bob!",
        },
      },
      null,
      2,
    ),
  )
  const [showTypedDataInput, setShowTypedDataInput] = useState<boolean>(false)
  const providerRef = useRef<InstanceType<typeof EthereumProvider> | null>(null)

  // Helper function to get provider (from ref, global, or state)
  const getProvider = useCallback((): InstanceType<
    typeof EthereumProvider
  > | null => {
    return (
      providerRef.current ||
      (window as any).walletconnect_shared_provider ||
      provider
    )
  }, [provider])

  // Helper function to get accounts from provider
  const getAccountsFromProvider = useCallback(
    (ethProvider: InstanceType<typeof EthereumProvider>): string[] => {
      // First try provider.accounts
      if (ethProvider.accounts && ethProvider.accounts.length > 0) {
        return ethProvider.accounts
      }

      // Fallback to session namespaces
      if (ethProvider.session?.namespaces?.eip155?.accounts) {
        const sessionAccounts = ethProvider.session.namespaces.eip155.accounts
        return sessionAccounts
          .filter((acc: string) => acc.startsWith("eip155:"))
          .map((acc: string) => {
            const parts = acc.split(":")
            return parts[2] // Extract address part
          })
      }

      return []
    },
    [],
  )

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
    const sharedProviderKey = "walletconnect_shared_provider"
    const initFlagKey = "walletconnect_init_in_progress"

    // Check if initialization is already in progress
    if ((window as any)[initFlagKey]) {
      return
    }

    // Check if provider already exists and is set in state
    if (provider && providerRef.current) {
      return
    }

    // Helper function to setup event listeners
    const setupEventListeners = (
      ethProvider: InstanceType<typeof EthereumProvider>,
    ) => {
      ethProvider.on("display_uri", (uri: string) => {
        setConnectionUri(uri)
      })

      ethProvider.on("connect", () => {
        const providerAccounts = getAccountsFromProvider(ethProvider)
        if (providerAccounts.length > 0) {
          setAccounts(providerAccounts)
        }
        setError(null)
      })

      ethProvider.on("disconnect", () => {
        setAccounts([])
        localStorage.removeItem("walletconnect_connected")
        window.dispatchEvent(new CustomEvent("walletconnect:disconnected"))
      })

      ethProvider.on("accountsChanged", (newAccounts: string[]) => {
        if (newAccounts && newAccounts.length > 0) {
          setAccounts(newAccounts)
        }
      })

      ethProvider.on("chainChanged", () => {
        console.log("chainChanged:", ethProvider.session)
      })
    }

    // If shared provider exists, use it immediately (synchronous)
    if ((window as any)[sharedProviderKey]) {
      const existingProvider = (window as any)[sharedProviderKey]
      setProvider(existingProvider)
      providerRef.current = existingProvider

      // Restore accounts immediately
      const providerAccounts = getAccountsFromProvider(existingProvider)
      if (providerAccounts.length > 0) {
        setAccounts(providerAccounts)
      }

      // Setup event listeners only if not already set up
      if (!(existingProvider as any)._listenersSetup) {
        setupEventListeners(existingProvider)
        ;(existingProvider as any)._listenersSetup = true
      }

      return
    }

    const initProvider = async () => {
      try {
        // Mark initialization as in progress
        (window as any)[initFlagKey] = true

        // Create new provider with all supported methods
        const ethProvider = await EthereumProvider.init({
          projectId: PROJECT_ID,
          chains: [1, 137, 56, 8453, 42161, 11155111], // Ethereum Mainnet
          optionalChains: [137, 56, 8453, 42161, 11155111],
          showQrModal: false,
          metadata: {
            name: "WalletConnect Test dApp",
            description: "Test dApp for NFID Wallet",
            url: window.location.origin,
            icons: ["https://nfid.one/assets/nfid-wallet-og.png"],
          },
          methods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData",
            "eth_signTypedData_v4",
          ],
          optionalMethods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData",
            "eth_signTypedData_v4",
          ],
        })

        // Store provider globally for reuse
        const key = sharedProviderKey
        ;(window as any)[key] = ethProvider

        // Setup event listeners
        setupEventListeners(ethProvider)
        ;(ethProvider as any)._listenersSetup = true

        setProvider(ethProvider)
        providerRef.current = ethProvider

        // Restore accounts if already connected
        if (ethProvider.connected && ethProvider.session) {
          const providerAccounts = getAccountsFromProvider(ethProvider)
          if (providerAccounts.length > 0) {
            setAccounts(providerAccounts)
          }
        }

        // Clear initialization flag
        (window as any)[initFlagKey] = false
      } catch (err) {
        (window as any)[initFlagKey] = false
        console.error("Failed to initialize provider:", err)
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize provider"
        handleError(errorMessage)
      }
    }

    initProvider()

    return () => {
      if (testMethod === "connect" && providerRef.current) {
        providerRef.current = null
      }
    }
  }, [handleError, getAccountsFromProvider, testMethod, provider])

  useEffect(() => {
    if (error) {
      onError({ error })
    }
  }, [error, onError])

  const handleConnect = async () => {
    const providerToConnect = getProvider()
    if (!providerToConnect) {
      handleError("Provider not initialized")
      return
    }

    try {
      setIsConnecting(true)
      setError(null)
      setConnectionUri(null)

      const connectedAccounts = await providerToConnect.enable()
      setAccounts(connectedAccounts)

      if (onResponse) {
        onResponse({
          accounts: connectedAccounts,
          chainId: 1,
          connected: true,
        })
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to wallet"
      handleError(errorMessage)
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
      handleError("Please connect wallet first")
      return
    }
    setShowMessageInput(true)
  }

  const handlePersonalSign = async () => {
    const providerToUse = getProvider()
    if (!providerToUse) {
      handleError("Provider not initialized")
      return
    }

    // Ensure provider is connected
    if (!providerToUse.session || !providerToUse.connected) {
      try {
        const connectedAccounts = await providerToUse.enable()
        setAccounts(connectedAccounts)
      } catch (_reconnectError) {
        handleError("Please connect wallet first. Failed to reconnect.")
        return
      }
    }

    const providerAccounts = getAccountsFromProvider(providerToUse)
    if (providerAccounts.length === 0) {
      handleError("No accounts available. Please connect wallet first.")
      return
    }

    if (!messageToSign.trim()) {
      handleError("Please enter a message to sign")
      return
    }

    try {
      setError(null)
      const address = providerAccounts[0]
      const requestParams = [messageToSign, address]

      setPendingRequest({ method: "personal_sign", params: requestParams })

      const signature = await providerToUse.request({
        method: "personal_sign",
        params: requestParams,
      })

      setPendingRequest(null)

      if (onResponse) {
        onResponse({
          method: "personal_sign",
          signature,
          message: messageToSign,
          address,
        })
      }

      setShowMessageInput(false)
      alert(`Message signed successfully!\n\nSignature: ${signature}`)
    } catch (err) {
      setPendingRequest(null)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign message"
      handleError(errorMessage)
    }
  }

  const handleEthSign = async () => {
    const providerToUse = getProvider()
    if (!providerToUse) {
      handleError("Provider not initialized")
      return
    }

    // Ensure provider is connected
    if (!providerToUse.session || !providerToUse.connected) {
      try {
        const connectedAccounts = await providerToUse.enable()
        setAccounts(connectedAccounts)
      } catch (_reconnectError) {
        handleError("Please connect wallet first. Failed to reconnect.")
        return
      }
    }

    const providerAccounts = getAccountsFromProvider(providerToUse)
    if (providerAccounts.length === 0) {
      handleError("No accounts available. Please connect wallet first.")
      return
    }

    try {
      setError(null)

      const address = providerAccounts[0]
      const message = "Hello from WalletConnect Test dApp!"
      const messageBytes = Buffer.from(message)
      const hash = `0x${messageBytes.toString("hex").padEnd(64, "0").slice(0, 64)}`

      const requestParams = [address, hash]
      setPendingRequest({ method: "eth_sign", params: requestParams })

      const signature = await providerToUse.request({
        method: "eth_sign",
        params: requestParams,
      })

      setPendingRequest(null)

      if (onResponse) {
        onResponse({
          method: "eth_sign",
          signature,
          address,
          hash,
        })
      }

      alert(
        `Hash signed successfully!\n\nHash: ${hash}\nSignature: ${signature}`,
      )
    } catch (err) {
      setPendingRequest(null)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign hash"
      handleError(errorMessage)
    }
  }

  const handleSignTransactionClick = () => {
    if (!isConnected) {
      handleError("Please connect wallet first")
      return
    }
    setShowTransactionInput(true)
  }

  // Helper function to normalize hex strings for data/addresses (ensure even length)
  const normalizeHexData = (value: string | undefined): string | undefined => {
    if (!value) return value
    let hex = value.trim()

    // Remove 0x prefix if present
    if (hex.startsWith("0x") || hex.startsWith("0X")) {
      hex = hex.slice(2)
    }

    // If empty after removing prefix, return "0x"
    if (!hex) return "0x"

    // Ensure even length by adding leading zero if needed
    if (hex.length % 2 !== 0) {
      hex = "0" + hex
    }

    return "0x" + hex
  }

  // Helper function to convert integer to hex string
  const integerToHex = (integer: string | undefined): string => {
    if (!integer || integer === "") return "0x0"
    try {
      const value = BigInt(integer)
      return "0x" + value.toString(16)
    } catch {
      return "0x0"
    }
  }

  const handleSignTransaction = async () => {
    const providerToUse = getProvider()
    if (!providerToUse) {
      handleError("Provider not initialized")
      return
    }

    // Ensure provider is connected
    if (!providerToUse.session || !providerToUse.connected) {
      try {
        const connectedAccounts = await providerToUse.enable()
        setAccounts(connectedAccounts)
      } catch (_reconnectError) {
        handleError("Please connect wallet first. Failed to reconnect.")
        return
      }
    }

    const providerAccounts = getAccountsFromProvider(providerToUse)
    if (providerAccounts.length === 0) {
      handleError("No accounts available. Please connect wallet first.")
      return
    }

    if (!toAddress.trim()) {
      handleError("Please enter 'to' address")
      return
    }

    // Validate and normalize 'to' address
    const normalizedToAddress = toAddress.trim()
    if (!isAddress(normalizedToAddress)) {
      handleError("Invalid 'to' address format")
      return
    }

    try {
      setError(null)
      const address = providerAccounts[0]

      const transaction: EthereumTransactionParams = {
        from: address,
        to: normalizedToAddress,
        value: integerToHex(txValue),
        gas: integerToHex(txGas),
        gasPrice: integerToHex(txGasPrice),
        nonce: integerToHex(txNonce),
        data: normalizeHexData(txData) || "0x",
        chainId: integerToHex(txChainId) || "0x1",
      }

      setPendingRequest({
        method: "eth_signTransaction",
        params: [transaction],
      })

      const signature = await providerToUse.request({
        method: "eth_signTransaction",
        params: [transaction],
      })

      setPendingRequest(null)

      if (onResponse) {
        onResponse({
          method: "eth_signTransaction",
          signature,
          transaction,
        })
      }

      setShowTransactionInput(false)
      alert(`Transaction signed successfully!\n\nSignature: ${signature}`)
    } catch (err) {
      setPendingRequest(null)
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to sign transaction ${JSON.stringify(err)}`
      handleError(errorMessage)
    }
  }

  const handleSendTransactionClick = () => {
    if (!isConnected) {
      handleError("Please connect wallet first")
      return
    }
    setShowTransactionInput(true)
  }

  const handleSendTransaction = async () => {
    const providerToUse = getProvider()
    if (!providerToUse) {
      handleError("Provider not initialized")
      return
    }

    // Ensure provider is connected
    if (!providerToUse.session || !providerToUse.connected) {
      try {
        const connectedAccounts = await providerToUse.enable()
        setAccounts(connectedAccounts)
      } catch (_reconnectError) {
        handleError("Please connect wallet first. Failed to reconnect.")
        return
      }
    }

    const providerAccounts = getAccountsFromProvider(providerToUse)
    if (providerAccounts.length === 0) {
      handleError("No accounts available. Please connect wallet first.")
      return
    }

    if (!toAddress.trim()) {
      handleError("Please enter 'to' address")
      return
    }

    // Validate and normalize 'to' address
    const normalizedToAddress = toAddress.trim()
    if (!isAddress(normalizedToAddress)) {
      handleError("Invalid 'to' address format")
      return
    }

    try {
      setError(null)
      const address = providerAccounts[0]

      const transaction: EthereumTransactionParams = {
        from: address,
        to: normalizedToAddress,
        value: integerToHex(txValue),
        gas: integerToHex(txGas),
        gasPrice: integerToHex(txGasPrice),
        data: normalizeHexData(txData) || "0x",
        chainId: integerToHex(txChainId) || "0x1",
      }

      setPendingRequest({
        method: "eth_sendTransaction",
        params: [transaction],
      })

      const txHash = await providerToUse.request({
        method: "eth_sendTransaction",
        params: [transaction],
      })

      setPendingRequest(null)

      if (onResponse) {
        onResponse({
          method: "eth_sendTransaction",
          txHash,
          transaction,
        })
      }

      setShowTransactionInput(false)
      alert(
        `Transaction sent successfully!\n\nTransaction Hash: ${txHash}\n\nWARNING: This transaction has been broadcast to the network!`,
      )
    } catch (err) {
      setPendingRequest(null)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send transaction"
      handleError(errorMessage)
    }
  }

  const handleSignTypedDataClick = () => {
    if (!isConnected) {
      handleError("Please connect wallet first")
      return
    }
    setShowTypedDataInput(true)
  }

  const handleSignTypedData = async () => {
    const providerToUse = getProvider()
    if (!providerToUse) {
      handleError("Provider not initialized")
      return
    }

    // Ensure provider is connected
    if (!providerToUse.session || !providerToUse.connected) {
      try {
        const connectedAccounts = await providerToUse.enable()
        setAccounts(connectedAccounts)
      } catch (_reconnectError) {
        handleError("Please connect wallet first. Failed to reconnect.")
        return
      }
    }

    const providerAccounts = getAccountsFromProvider(providerToUse)
    if (providerAccounts.length === 0) {
      handleError("No accounts available. Please connect wallet first.")
      return
    }

    if (!typedData.trim()) {
      handleError("Please enter typed data")
      return
    }

    try {
      setError(null)
      const address = providerAccounts[0]

      // Parse typed data JSON
      let parsedTypedData: any
      try {
        parsedTypedData = JSON.parse(typedData)
      } catch (_parseError) {
        handleError("Invalid JSON format for typed data")
        return
      }

      const requestParams = [address, parsedTypedData]
      setPendingRequest({
        method: "eth_signTypedData_v4",
        params: requestParams,
      })

      const signature = await providerToUse.request({
        method: "eth_signTypedData_v4",
        params: requestParams,
      })

      setPendingRequest(null)

      if (onResponse) {
        onResponse({
          method: "eth_signTypedData_v4",
          signature,
          typedData: parsedTypedData,
          address,
        })
      }

      setShowTypedDataInput(false)
      alert(`Typed data signed successfully!\n\nSignature: ${signature}`)
    } catch (err) {
      setPendingRequest(null)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign typed data"
      handleError(errorMessage)
    }
  }

  const handleDisconnect = async () => {
    if (!provider) return

    try {
      await provider.disconnect()
      setAccounts([])
      setError(null)
      localStorage.removeItem("walletconnect_connected")
      window.dispatchEvent(new CustomEvent("walletconnect:disconnected"))
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to disconnect"
      handleError(errorMessage)
    }
  }

  // Determine connection status
  const isConnected =
    externalIsConnected !== undefined
      ? externalIsConnected
      : accounts.length > 0 ||
        (provider?.connected && provider?.accounts?.length > 0)

  // Check if shared provider exists in window (for immediate use)
  const sharedProviderKey = "walletconnect_shared_provider"
  const sharedProviderExists = !!(window as any)[sharedProviderKey]

  // Show loading only if provider is not set AND shared provider doesn't exist
  if (!provider && !sharedProviderExists) {
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
            {testMethod === "eth_signTypedData_v4" && (
              <>
                {!showTypedDataInput ? (
                  <Button
                    className="h-10 w-full"
                    isSmall
                    onClick={handleSignTypedDataClick}
                    disabled={
                      !isConnected ||
                      (externalIsConnected !== undefined &&
                        !externalIsConnected)
                    }
                  >
                    Sign Typed Data
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Typed Data (EIP-712 JSON):
                    </label>
                    <textarea
                      value={typedData}
                      onChange={(e) => setTypedData(e.target.value)}
                      placeholder='{"domain": {...}, "types": {...}, "message": {...}}'
                      className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      rows={15}
                    />
                    <div className="flex gap-2">
                      <Button
                        className="h-10 flex-1"
                        isSmall
                        onClick={handleSignTypedData}
                        disabled={!typedData.trim()}
                      >
                        Sign
                      </Button>
                      <Button
                        className="h-10"
                        isSmall
                        onClick={() => {
                          setShowTypedDataInput(false)
                          setTypedData(
                            JSON.stringify(
                              {
                                domain: {
                                  name: "Example DApp",
                                  version: "1",
                                  chainId: 1,
                                  verifyingContract:
                                    "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
                                },
                                types: {
                                  Person: [
                                    { name: "name", type: "string" },
                                    { name: "wallet", type: "address" },
                                  ],
                                  Mail: [
                                    { name: "from", type: "Person" },
                                    { name: "to", type: "Person" },
                                    { name: "contents", type: "string" },
                                  ],
                                },
                                primaryType: "Mail",
                                message: {
                                  from: {
                                    name: "Alice",
                                    wallet:
                                      "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                                  },
                                  to: {
                                    name: "Bob",
                                    wallet:
                                      "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
                                  },
                                  contents: "Hello, Bob!",
                                },
                              },
                              null,
                              2,
                            ),
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
            {(testMethod === "eth_signTransaction" ||
              testMethod === "eth_sendTransaction") && (
              <>
                {!showTransactionInput ? (
                  <Button
                    className="h-10 w-full"
                    isSmall
                    onClick={
                      testMethod === "eth_signTransaction"
                        ? handleSignTransactionClick
                        : handleSendTransactionClick
                    }
                    disabled={
                      !isConnected ||
                      (externalIsConnected !== undefined &&
                        !externalIsConnected)
                    }
                  >
                    {testMethod === "eth_signTransaction"
                      ? "Sign Transaction"
                      : "Send Transaction"}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Transaction Parameters:
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          From Address:
                        </label>
                        <input
                          type="text"
                          value={accounts[0] || ""}
                          disabled
                          className="w-full px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          To Address:
                        </label>
                        <input
                          type="text"
                          value={toAddress}
                          onChange={(e) => setToAddress(e.target.value)}
                          placeholder="0x..."
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Value (wei, integer):
                        </label>
                        <input
                          type="text"
                          value={txValue}
                          onChange={(e) => setTxValue(e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          Hex: {integerToHex(txValue)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Gas Limit (integer):
                        </label>
                        <input
                          type="text"
                          value={txGas}
                          onChange={(e) => setTxGas(e.target.value)}
                          placeholder="21000"
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          Hex: {integerToHex(txGas)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Gas Price (wei, integer):
                        </label>
                        <input
                          type="text"
                          value={txGasPrice}
                          onChange={(e) => setTxGasPrice(e.target.value)}
                          placeholder="1000000000"
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          Hex: {integerToHex(txGasPrice)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Nonce (integer, optional for send):
                        </label>
                        <input
                          type="text"
                          value={txNonce}
                          onChange={(e) => setTxNonce(e.target.value)}
                          placeholder="1"
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          Hex: {integerToHex(txNonce)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Data (hex):
                        </label>
                        <input
                          type="text"
                          value={txData}
                          onChange={(e) => setTxData(e.target.value)}
                          placeholder="0x"
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Chain ID:
                        </label>
                        <input
                          type="text"
                          value={txChainId}
                          onChange={(e) => setTxChainId(e.target.value)}
                          placeholder="1"
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="h-10 flex-1"
                        isSmall
                        onClick={
                          testMethod === "eth_signTransaction"
                            ? handleSignTransaction
                            : handleSendTransaction
                        }
                        disabled={!toAddress.trim()}
                      >
                        {testMethod === "eth_signTransaction" ? "Sign" : "Send"}
                      </Button>
                      <Button
                        className="h-10"
                        isSmall
                        onClick={() => {
                          setShowTransactionInput(false)
                          setToAddress(
                            "0xff14E6e1DE9762929F7d2431482bfC2E63bd9d50",
                          )
                          setTxValue("0")
                          setTxGas("21000")
                          setTxGasPrice("1000000000")
                          setTxNonce("1")
                          setTxData("0x")
                          setTxChainId("1")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
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

      {pendingRequest &&
        (testMethod === "personal_sign" ||
          testMethod === "eth_sign" ||
          testMethod === "eth_signTransaction" ||
          testMethod === "eth_sendTransaction" ||
          testMethod === "eth_signTypedData_v4") && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-blue-900">
              Sign Request Sent:
            </p>
            <div className="space-y-2">
              <p className="text-xs text-blue-700">
                Request sent via WalletConnect protocol. The wallet should
                automatically receive the request and open a confirmation
                window.
              </p>
              <p className="text-xs text-blue-700">
                <strong>Status:</strong> Waiting for wallet approval...
              </p>
              <p className="text-xs text-blue-700">Request details:</p>
              <div className="p-2 bg-white border border-blue-300 rounded text-xs">
                <p className="font-mono break-all">
                  Method: {pendingRequest.method}
                </p>
                {testMethod === "personal_sign" ? (
                  <>
                    <p className="font-mono break-all mt-1">
                      Message: {pendingRequest.params[0]}
                    </p>
                    <p className="font-mono break-all mt-1">
                      Address: {pendingRequest.params[1]}
                    </p>
                  </>
                ) : testMethod === "eth_sign" ? (
                  <>
                    <p className="font-mono break-all mt-1">
                      Address: {pendingRequest.params[0]}
                    </p>
                    <p className="font-mono break-all mt-1">
                      Hash: {pendingRequest.params[1]}
                    </p>
                  </>
                ) : testMethod === "eth_signTypedData_v4" ? (
                  <>
                    <p className="font-mono break-all mt-1">
                      Address: {pendingRequest.params[0]}
                    </p>
                    <p className="font-mono break-all mt-1 text-xs whitespace-pre-wrap">
                      Typed Data:{" "}
                      {JSON.stringify(pendingRequest.params[1], null, 2)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-mono break-all mt-1">
                      To: {pendingRequest.params[0]?.to || "N/A"}
                    </p>
                    <p className="font-mono break-all mt-1">
                      Value: {pendingRequest.params[0]?.value || "0x0"}
                    </p>
                    <p className="font-mono break-all mt-1">
                      Gas: {pendingRequest.params[0]?.gas || "N/A"}
                    </p>
                    <p className="font-mono break-all mt-1">
                      Chain ID: {pendingRequest.params[0]?.chainId || "N/A"}
                    </p>
                  </>
                )}
              </div>
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

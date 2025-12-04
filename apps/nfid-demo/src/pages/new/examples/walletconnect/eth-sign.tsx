import { useCallback, useEffect, useState } from "react"

import { ExampleMethod } from "../../method"
import { SectionTemplate } from "../../section"
import { WalletConnectExample } from "./walletconnect"

const CODE_SNIPPET = `import { EthereumProvider } from "@walletconnect/ethereum-provider"

// Initialize WalletConnect provider
const provider = await EthereumProvider.init({
  projectId: "YOUR_PROJECT_ID",
  chains: [1], // Ethereum Mainnet
  showQrModal: true,
  metadata: {
    name: "Your dApp Name",
    description: "Your dApp Description",
    url: window.location.origin,
    icons: ["https://your-app.com/icon.png"],
  },
})

// Connect to wallet
const accounts = await provider.enable()

// Sign a hash using eth_sign
// Note: hash must be a 32-byte hex string (0x + 64 hex characters)
const hash = "0x..." // 32-byte hash
const signature = await provider.request({
  method: "eth_sign",
  params: [address, hash],
})
`

export const WalletConnectEthSign = () => {
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string>()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = () => {
      const connected =
        localStorage.getItem("walletconnect_connected") === "true"
      setIsConnected(connected)
    }

    checkConnection()

    const handleConnected = () => {
      setIsConnected(true)
    }

    const handleDisconnected = () => {
      setIsConnected(false)
    }

    window.addEventListener("walletconnect:connected", handleConnected)
    window.addEventListener("walletconnect:disconnected", handleDisconnected)
    return () => {
      window.removeEventListener("walletconnect:connected", handleConnected)
      window.removeEventListener(
        "walletconnect:disconnected",
        handleDisconnected,
      )
    }
  }, [])

  const handleError = useCallback((error: { error: string }) => {
    setError(error.error)
    setResponse({ error: error.error })
  }, [])

  const handleResponse = useCallback((data: any) => {
    setResponse(data)
    setError(undefined)
  }, [])

  return (
    <SectionTemplate
      id="walletconnect-eth-sign"
      title="5.2. WalletConnect - eth_sign"
      method="eth_sign"
      subtitle={
        <>
          Sign a 32-byte hash using the <ExampleMethod>eth_sign</ExampleMethod>{" "}
          method. This method signs a pre-computed hash. The hash must be
          exactly 32 bytes (64 hex characters after 0x prefix).
        </>
      }
      codeSnippet={CODE_SNIPPET}
      jsonResponse={
        error
          ? JSON.stringify({ error }, null, 2)
          : response
            ? JSON.stringify(response, null, 2)
            : "{}"
      }
      example={
        <WalletConnectExample
          onError={handleError}
          onResponse={handleResponse}
          testMethod="eth_sign"
          isConnected={isConnected}
        />
      }
    />
  )
}

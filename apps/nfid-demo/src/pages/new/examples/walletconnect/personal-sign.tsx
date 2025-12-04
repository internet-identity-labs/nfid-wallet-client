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

// Sign a message using personal_sign
const signature = await provider.request({
  method: "personal_sign",
  params: [message, address],
})
`

export const WalletConnectPersonalSign = () => {
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string>()
  const [isConnected, setIsConnected] = useState(false)

  // Check connection state on mount and listen for connection events
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
      id="walletconnect-personal-sign"
      title="5.1. WalletConnect - personal_sign"
      method="personal_sign"
      subtitle={
        <>
          Sign a message using the <ExampleMethod>personal_sign</ExampleMethod>{" "}
          method. This method signs a message that can be verified on-chain. The
          message can be a plain text string or a hex-encoded string.
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
          testMethod="personal_sign"
          isConnected={isConnected}
        />
      }
    />
  )
}

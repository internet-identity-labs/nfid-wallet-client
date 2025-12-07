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

// Sign typed data using eth_signTypedData_v4 (EIP-712)
const typedData = {
  domain: {
    name: "Example DApp",
    version: "1",
    chainId: 1,
    verifyingContract: "0x...",
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
      wallet: "0x...",
    },
    to: {
      name: "Bob",
      wallet: "0x...",
    },
    contents: "Hello, Bob!",
  },
}

const signature = await provider.request({
  method: "eth_signTypedData_v4",
  params: [address, typedData],
})
`

export const WalletConnectEthSignTypedDataV4 = () => {
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

    // Check connection periodically in case localStorage was updated
    const interval = setInterval(() => {
      checkConnection()
    }, 500)

    window.addEventListener("walletconnect:connected", handleConnected)
    window.addEventListener("walletconnect:disconnected", handleDisconnected)
    return () => {
      clearInterval(interval)
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
      id="walletconnect-eth-sign-typed-data-v4"
      title="5.5. WalletConnect - eth_signTypedData_v4"
      method="eth_signTypedData_v4"
      subtitle={
        <>
          Sign typed data using the{" "}
          <ExampleMethod>eth_signTypedData_v4</ExampleMethod> method (EIP-712).
          This method signs structured data that can be verified on-chain. The
          typed data must follow the EIP-712 standard format with domain, types,
          and message.
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
          testMethod="eth_signTypedData_v4"
          isConnected={isConnected}
        />
      }
    />
  )
}

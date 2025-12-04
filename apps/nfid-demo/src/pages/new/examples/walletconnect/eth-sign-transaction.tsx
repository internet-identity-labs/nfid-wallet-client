import React, { useCallback, useEffect, useState } from "react"

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

// Sign a transaction without sending it
const transaction = {
  from: address,
  to: "0x...",
  value: "0x0", // in wei (hex)
  gas: "0x5208", // gas limit (hex)
  gasPrice: "0x3b9aca00", // gas price in wei (hex)
  nonce: "0x0", // optional, will be fetched if not provided
  data: "0x", // contract call data (hex)
  chainId: 1,
}

const signature = await provider.request({
  method: "eth_signTransaction",
  params: [transaction],
})
`

export const WalletConnectEthSignTransaction = () => {
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
      id="walletconnect-eth-sign-transaction"
      title="5.3. WalletConnect - eth_signTransaction"
      method="eth_signTransaction"
      subtitle={
        <>
          Sign a transaction without sending it to the network using{" "}
          <ExampleMethod>eth_signTransaction</ExampleMethod>. This method
          returns the signed transaction that can be broadcast later. Useful for
          offline signing or multi-step transaction flows.
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
          testMethod="eth_signTransaction"
          isConnected={isConnected}
        />
      }
    />
  )
}

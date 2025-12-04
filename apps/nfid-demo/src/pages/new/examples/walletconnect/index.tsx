import React, { useCallback, useState } from "react"

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

// 1. personal_sign - Sign a message
const signature = await provider.request({
  method: "personal_sign",
  params: [message, address],
})

// 2. eth_sign - Sign a hash
const hashSignature = await provider.request({
  method: "eth_sign",
  params: [address, hash],
})

// 3. eth_signTransaction - Sign a transaction (without sending)
const txSignature = await provider.request({
  method: "eth_signTransaction",
  params: [transaction],
})

// 4. eth_sendTransaction - Sign and send a transaction
const txHash = await provider.request({
  method: "eth_sendTransaction",
  params: [transaction],
})
`

export const WalletConnect = () => {
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string>()

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
      id="walletconnect"
      title="5. WalletConnect Integration"
      method="EthereumProvider.init()"
      subtitle={
        <>
          Connect to NFID Wallet using WalletConnect protocol. This allows dApps
          to connect to NFID Wallet and request transaction signing. After
          initializing the <ExampleMethod>EthereumProvider</ExampleMethod>, call{" "}
          <ExampleMethod>provider.enable()</ExampleMethod> to connect. The
          wallet will receive a connection request that the user can approve or
          reject.
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
        />
      }
    />
  )
}

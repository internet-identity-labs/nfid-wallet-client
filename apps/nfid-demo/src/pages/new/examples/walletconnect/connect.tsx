import { useCallback, useState } from "react"

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
`

export const WalletConnectConnect = () => {
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string>()

  const handleError = useCallback((error: { error: string }) => {
    setError(error.error)
    setResponse({ error: error.error })
  }, [])

  const handleResponse = useCallback((data: any) => {
    setResponse(data)
    setError(undefined)

    // Save connection state to localStorage
    if (data.connected && data.accounts && data.accounts.length > 0) {
      localStorage.setItem("walletconnect_connected", "true")
      localStorage.setItem(
        "walletconnect_accounts",
        JSON.stringify(data.accounts),
      )

      // Dispatch event to notify other sections
      window.dispatchEvent(
        new CustomEvent("walletconnect:connected", {
          detail: { accounts: data.accounts },
        }),
      )
    }
  }, [])

  return (
    <SectionTemplate
      id="walletconnect-connect"
      title="5.0. WalletConnect - Connect"
      method="EthereumProvider.init()"
      subtitle={
        <>
          Connect to NFID Wallet using WalletConnect protocol. After
          initializing the <ExampleMethod>EthereumProvider</ExampleMethod>, call{" "}
          <ExampleMethod>provider.enable()</ExampleMethod> to connect. The
          wallet will receive a connection request that the user can approve or
          reject. Once connected, you can use the other WalletConnect methods
          below.
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
          testMethod="connect"
        />
      }
    />
  )
}

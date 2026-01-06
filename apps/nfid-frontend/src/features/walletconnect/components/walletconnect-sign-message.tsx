import React from "react"
import { SignClientTypes } from "@walletconnect/types"

import { EthereumTransactionParams } from "./walletconnect-types"
import { WalletConnectSignSimpleMessage } from "./walletconnect-sign-simple-message"
import { WalletConnectSignTypedData } from "./walletconnect-sign-typed-data"
import { WalletConnectSignTransaction } from "./walletconnect-sign-transaction"

interface WalletConnectSignMessageProps {
  request: SignClientTypes.EventArguments["session_request"]
  dAppOrigin: string
  isLoading?: boolean
  onSign: () => void
  onCancel: () => void
  error?: string | null
}

/**
 * Router component for displaying WalletConnect sign requests
 * Routes to appropriate component based on request method
 */
export const WalletConnectSignMessage: React.FC<
  WalletConnectSignMessageProps
> = ({ request, dAppOrigin, isLoading = false, onSign, onCancel, error }) => {
  const method = request.params.request.method
  const params = request.params.request.params

  // Check request type
  const isTypedData =
    method === "eth_signTypedData" || method === "eth_signTypedData_v4"
  const isTransaction =
    method === "eth_signTransaction" || method === "eth_sendTransaction"

  // Route to appropriate component based on method
  if (isTransaction) {
    const [tx] = params as [EthereumTransactionParams]
    return (
      <WalletConnectSignTransaction
        transaction={tx}
        method={method}
        dAppOrigin={dAppOrigin}
        isLoading={isLoading}
        onSign={onSign}
        onCancel={onCancel}
        error={error}
      />
    )
  }

  if (isTypedData) {
    const [, typedDataParam] = params as [string, any]
    // Parse typed data if it's a string
    let typedData: any
    if (typeof typedDataParam === "string") {
      try {
        typedData = JSON.parse(typedDataParam)
      } catch {
        typedData = typedDataParam
      }
    } else {
      typedData = typedDataParam
    }

    return (
      <WalletConnectSignTypedData
        typedData={typedData}
        dAppOrigin={dAppOrigin}
        isLoading={isLoading}
        onSign={onSign}
        onCancel={onCancel}
        error={error}
      />
    )
  }

  // Simple message signing (personal_sign, eth_sign)
  let message: string = ""
  if (method === "personal_sign") {
    const [messageHex] = params as [string, string]
    if (messageHex.startsWith("0x")) {
      try {
        message = Buffer.from(messageHex.slice(2), "hex").toString("utf8")
      } catch {
        message = messageHex
      }
    } else {
      message = messageHex
    }
  } else if (method === "eth_sign") {
    const [, hash] = params as [string, string]
    message = hash
  }

  return (
    <WalletConnectSignSimpleMessage
      message={message}
      method={method}
      dAppOrigin={dAppOrigin}
      isLoading={isLoading}
      onSign={onSign}
      onCancel={onCancel}
      error={error}
    />
  )
}

// Re-export types for backward compatibility
export type { EthereumTransactionParams } from "./walletconnect-types"

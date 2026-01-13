import { SignClientTypes } from "@walletconnect/types"
import React from "react"

import {
  EthereumTransactionParams,
  ValidationStatus,
  WCGasData,
} from "../types"

import { WalletConnectSignSimpleMessage } from "./sign-simple-message"
import { WalletConnectSignTransaction } from "./sign-transaction"
import { WalletConnectSignTypedData } from "./sign-typed-data"

interface WalletConnectSignMessageProps {
  request: SignClientTypes.EventArguments["session_request"]
  dAppOrigin: string
  isLoading?: boolean
  onSign: () => Promise<void>
  onCancel: () => void
  error?: string | null
  validationStatus: ValidationStatus
  chainId: string
  fee?: WCGasData
}

export const WalletConnectSignMessage: React.FC<
  WalletConnectSignMessageProps
> = ({
  request,
  dAppOrigin,
  isLoading = false,
  onSign,
  onCancel,
  error,
  validationStatus,
  chainId,
  fee,
}) => {
  const method = request.params.request.method
  const params = request.params.request.params

  const isTypedData =
    method === "eth_signTypedData" || method === "eth_signTypedData_v4"
  const isTransaction =
    method === "eth_signTransaction" || method === "eth_sendTransaction"

  if (isTransaction) {
    const [tx] = params as [EthereumTransactionParams]
    return (
      <WalletConnectSignTransaction
        transaction={tx}
        dAppOrigin={dAppOrigin}
        isLoading={isLoading}
        onSign={onSign}
        onCancel={onCancel}
        error={error}
        validationStatus={validationStatus}
        chainId={chainId}
        fee={fee}
      />
    )
  }

  if (isTypedData) {
    const [, typedDataParam] = params as [string, any]
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
        validationStatus={validationStatus}
        chainId={chainId}
      />
    )
  }

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
      validationStatus={validationStatus}
      chainId={chainId}
    />
  )
}

export type { EthereumTransactionParams } from "../types"

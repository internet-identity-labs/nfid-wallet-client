import React from "react"
import { SignClientTypes } from "@walletconnect/types"

import {
  EthereumTransactionParams,
  ValidationStatus,
  WCGasData,
} from "../types"
import { WalletConnectSignSimpleMessage } from "./sign-simple-message"
import { WalletConnectSignTypedData } from "./sign-typed-data"
import { WalletConnectSignTransaction } from "./sign-transaction"
import { WalletConnectApproveAllowance } from "./approve-allowance"

const APPROVE_ALLOWANCE_DATA = "0x095ea7b3"
const INCREASE_ALLOWANCE_DATA = "0x39509351"
const DECREASE_ALLOWANCE_DATA = "0xa457c2d7"

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
  ethAddress: string | null
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
  ethAddress,
}) => {
  const method = request.params.request.method
  const params = request.params.request.params

  const isTypedData =
    method === "eth_signTypedData" || method === "eth_signTypedData_v4"
  const isTransaction =
    method === "eth_signTransaction" || method === "eth_sendTransaction"

  if (isTransaction) {
    const [tx] = params as [EthereumTransactionParams]
    const isApproval =
      tx.data?.startsWith(APPROVE_ALLOWANCE_DATA) ||
      tx.data?.startsWith(INCREASE_ALLOWANCE_DATA) ||
      tx.data?.startsWith(DECREASE_ALLOWANCE_DATA)

    if (isApproval) {
      return (
        <WalletConnectApproveAllowance
          transaction={tx}
          dAppOrigin={dAppOrigin}
          isLoading={isLoading}
          onSign={onSign}
          onCancel={onCancel}
          error={error}
          validationStatus={validationStatus}
          chainId={chainId}
          fee={fee}
          ethAddress={ethAddress}
        />
      )
    } else {
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
          ethAddress={ethAddress}
        />
      )
    }
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

import React from "react"
import { SignClientTypes } from "@walletconnect/types"

import { RPCPromptTemplate } from "frontend/features/identitykit/components/templates/prompt-template"
import { walletConnectService } from "frontend/integration/walletconnect"

/**
 * Ethereum transaction parameters as received from WalletConnect
 */
export interface EthereumTransactionParams {
  to?: string
  from?: string
  value?: string
  gas?: string | number
  gasLimit?: string | number
  gasPrice?: string | number
  maxFeePerGas?: string | number
  maxPriorityFeePerGas?: string | number
  nonce?: string | number
  data?: string
  chainId?: string | number
}

interface WalletConnectSignMessageProps {
  request: SignClientTypes.EventArguments["session_request"]
  dAppOrigin: string
  isLoading?: boolean
  onSign: () => void
  onCancel: () => void
  error?: string | null
}

/**
 * Component for displaying WalletConnect sign message request
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

  // Extract message, typed data, or transaction based on method
  let message: string = ""
  let typedData: any = null
  let transaction: EthereumTransactionParams | null = null

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
  } else if (isTypedData) {
    const [, typedDataParam] = params as [string, any]
    // Parse typed data if it's a string
    if (typeof typedDataParam === "string") {
      try {
        typedData = JSON.parse(typedDataParam)
      } catch {
        typedData = typedDataParam
      }
    } else {
      typedData = typedDataParam
    }
  } else if (isTransaction) {
    const [tx] = params as [EthereumTransactionParams]
    transaction = tx
  }

  // Get dApp hostname from origin
  let dAppHostname = "Unknown"
  try {
    if (dAppOrigin) {
      dAppHostname = new URL(dAppOrigin).hostname
    }
  } catch {
    dAppHostname = dAppOrigin || "Unknown"
  }

  // Get session to find network info
  const sessions = walletConnectService.getActiveSessions()
  const session = sessions.find((s) => s.topic === request.topic)
  const networkName = "Ethereum" // Default to Ethereum, can be enhanced later

  // Render typed data fields recursively
  const renderTypedDataFields = (data: any, level = 0): JSX.Element[] => {
    const fields: JSX.Element[] = []

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Nested object - render as a section
          fields.push(
            <div key={key} className={level > 0 ? "mt-2" : ""}>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {key}:
              </div>
              <div className="ml-3 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                {renderTypedDataFields(value, level + 1)}
              </div>
            </div>,
          )
        } else {
          // Primitive value
          fields.push(
            <div key={key} className="text-xs mb-1">
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {key}:
              </span>{" "}
              <span className="text-gray-800 dark:text-gray-200 font-mono break-all">
                {String(value)}
              </span>
            </div>,
          )
        }
      }
    }

    return fields
  }

  // Format value from wei to readable format
  const formatValue = (value?: string): string => {
    if (!value || value === "0x" || value === "0x0" || value === "0") {
      return "0 ETH"
    }
    try {
      const wei = BigInt(value.startsWith("0x") ? value : `0x${value}`)
      const eth = Number(wei) / 1e18
      return `${eth.toFixed(6)} ETH`
    } catch {
      return value
    }
  }

  // Format gas price
  const formatGasPrice = (gasPrice?: string | number): string => {
    if (!gasPrice) return "N/A"
    try {
      const price =
        typeof gasPrice === "string" ? BigInt(gasPrice) : BigInt(gasPrice)
      const gwei = Number(price) / 1e9
      return `${gwei.toFixed(2)} Gwei`
    } catch {
      return String(gasPrice)
    }
  }

  return (
    <RPCPromptTemplate
      title={
        isTransaction
          ? "Transaction request"
          : isTypedData
            ? "Sign typed message"
            : "Sign message"
      }
      subTitle={
        <div className="flex items-center justify-center gap-1 dark:text-white">
          Request from{" "}
          <span className="text-primaryButtonColor dark:text-teal-500">
            {dAppHostname}
          </span>
          <span className="text-green-500 ml-1">✓</span>
        </div>
      }
      primaryButtonText={isTransaction ? "Approve" : "Sign"}
      secondaryButtonText="Cancel"
      onPrimaryButtonClick={onSign}
      onSecondaryButtonClick={onCancel}
      isPrimaryDisabled={isLoading || !!error}
    >
      <div className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Network
          </p>
          <div className="flex items-center gap-2">
            {/* Ethereum logo - diamond shape */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 2L12.5 10L10 13L7.5 10L10 2Z"
                fill="#627EEA"
                stroke="#627EEA"
                strokeWidth="0.5"
              />
              <path
                d="M10 13L12.5 10L10 18L7.5 10L10 13Z"
                fill="#627EEA"
                stroke="#627EEA"
                strokeWidth="0.5"
              />
            </svg>
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {networkName}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {isTransaction
              ? "Request"
              : isTypedData
                ? "Message to sign"
                : "Message to sign"}
          </p>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {isTransaction && transaction ? (
              <div className="space-y-2">
                {transaction.from && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      From:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono break-all">
                      {transaction.from}
                    </span>
                  </div>
                )}
                {transaction.to && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      To:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono break-all">
                      {transaction.to}
                    </span>
                  </div>
                )}
                {transaction.value !== undefined && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Value:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono">
                      {formatValue(transaction.value)}
                    </span>
                  </div>
                )}
                {(transaction.gas || transaction.gasLimit) && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Gas Limit:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono">
                      {String(transaction.gas || transaction.gasLimit)}
                    </span>
                  </div>
                )}
                {transaction.maxFeePerGas && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Max Fee Per Gas:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono">
                      {formatGasPrice(transaction.maxFeePerGas)}
                    </span>
                  </div>
                )}
                {transaction.maxPriorityFeePerGas && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Max Priority Fee Per Gas:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono">
                      {formatGasPrice(transaction.maxPriorityFeePerGas)}
                    </span>
                  </div>
                )}
                {transaction.gasPrice && !transaction.maxFeePerGas && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Gas Price:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono">
                      {formatGasPrice(transaction.gasPrice)}
                    </span>
                  </div>
                )}
                {transaction.nonce !== undefined && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Nonce:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono">
                      {String(transaction.nonce)}
                    </span>
                  </div>
                )}
                {transaction.data && transaction.data !== "0x" && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Data:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono break-all">
                      {transaction.data}
                    </span>
                  </div>
                )}
                {transaction.chainId && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Chain ID:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-mono">
                      {String(transaction.chainId)}
                    </span>
                  </div>
                )}
              </div>
            ) : isTypedData && typedData ? (
              <div className="space-y-3">
                {/* Render all top-level fields of typed data */}
                {Object.entries(typedData).map(([key, value]) => {
                  // Skip internal fields that users don't need to see
                  if (key === "types" || key === "primaryType") {
                    return null
                  }

                  return (
                    <div key={key}>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </div>
                      {typeof value === "object" && value !== null ? (
                        <div className="ml-2 space-y-1">
                          {renderTypedDataFields(value)}
                        </div>
                      ) : (
                        <div className="ml-2 text-xs">
                          <span className="text-gray-800 dark:text-gray-200 font-mono break-all">
                            {String(value)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm font-mono break-words whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {message}
              </p>
            )}
          </div>
          {isTransaction && method === "eth_sendTransaction" && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold">
                ⚠️ Warning: This will send a real transaction to the network and
                cost gas fees!
              </p>
            </div>
          )}
        </div>
      </div>
    </RPCPromptTemplate>
  )
}

import React from "react"
import { SignClientTypes } from "@walletconnect/types"

import { WalletConnectPromptTemplate } from "./walletconnect-prompt-template"

interface WalletConnectRequestProps {
  request: SignClientTypes.EventArguments["session_request"]
  dAppOrigin: string
  isLoading?: boolean
  onApprove: () => void
  onReject: () => void
}

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

export const WalletConnectRequest: React.FC<WalletConnectRequestProps> = ({
  request,
  dAppOrigin,
  isLoading = false,
  onApprove,
  onReject,
}) => {
  const method = request.params.request.method
  const params = request.params.request.params

  const getRequestTitle = () => {
    switch (method) {
      case "personal_sign":
        return "Sign Message"
      case "eth_sign":
        return "Sign Hash"
      case "eth_signTransaction":
        return "Sign Transaction"
      case "eth_sendTransaction":
        return "Send Transaction"
      default:
        return `Approve ${method}`
    }
  }

  const getRequestContent = () => {
    switch (method) {
      case "personal_sign": {
        const [messageHex] = params as [string, string]
        let message: string
        if (messageHex.startsWith("0x")) {
          try {
            message = Buffer.from(messageHex.slice(2), "hex").toString("utf8")
          } catch {
            message = messageHex
          }
        } else {
          message = messageHex
        }
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Message to sign:
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-mono break-words whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )
      }
      case "eth_sign": {
        const [, hash] = params as [string, string]
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Hash to sign:
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-mono break-all text-gray-800 dark:text-gray-200">
                  {hash}
                </p>
              </div>
            </div>
          </div>
        )
      }
      case "eth_signTransaction":
      case "eth_sendTransaction": {
        const [tx] = params as [EthereumTransactionParams]
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Transaction Details:
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="text-xs">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    To:
                  </span>{" "}
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {tx.to || "Contract Creation"}
                  </span>
                </div>
                {tx.value && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Value:
                    </span>{" "}
                    <span className="font-mono text-gray-800 dark:text-gray-200">
                      {tx.value}
                    </span>
                  </div>
                )}
                {tx.gas && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Gas:
                    </span>{" "}
                    <span className="font-mono text-gray-800 dark:text-gray-200">
                      {tx.gas}
                    </span>
                  </div>
                )}
                {tx.data && tx.data !== "0x" && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Data:
                    </span>{" "}
                    <span className="font-mono break-all text-gray-800 dark:text-gray-200">
                      {tx.data}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {method === "eth_sendTransaction" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold">
                  ⚠️ Warning: This will send a real transaction to the network
                  and cost gas fees!
                </p>
              </div>
            )}
          </div>
        )
      }
      default:
        return (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Method: {method}
            </p>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(params, null, 2)}
            </pre>
          </div>
        )
    }
  }

  const applicationName = new URL(dAppOrigin).host

  return (
    <WalletConnectPromptTemplate
      title={getRequestTitle()}
      subTitle={
        <div className="dark:text-white">
          Request from{" "}
          <a
            href={dAppOrigin}
            target="_blank"
            className="no-underline text-primaryButtonColor dark:text-teal-500"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </div>
      }
      primaryButtonText="Approve"
      secondaryButtonText="Reject"
      isPrimaryDisabled={isLoading}
      isPrimaryLoading={isLoading}
      onPrimaryButtonClick={onApprove}
      onSecondaryButtonClick={onReject}
    >
      {getRequestContent()}
    </WalletConnectPromptTemplate>
  )
}

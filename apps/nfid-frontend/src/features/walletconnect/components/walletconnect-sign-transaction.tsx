import React from "react"

import { RPCPromptTemplate } from "frontend/features/identitykit/components/templates/prompt-template"
import {
  EthereumTransactionParams,
  WalletConnectSignRequestProps,
  formatValue,
  formatGasPrice,
  getDAppHostname,
} from "./walletconnect-types"

interface WalletConnectSignTransactionProps
  extends WalletConnectSignRequestProps {
  transaction: EthereumTransactionParams
  method: string
}

/**
 * Component for displaying transaction signing requests (eth_signTransaction, eth_sendTransaction)
 */
export const WalletConnectSignTransaction: React.FC<
  WalletConnectSignTransactionProps
> = ({
  transaction,
  method,
  dAppOrigin,
  isLoading,
  onSign,
  onCancel,
  error,
}) => {
  const dAppHostname = getDAppHostname(dAppOrigin)
  const isSendTransaction = method === "eth_sendTransaction"

  return (
    <RPCPromptTemplate
      title="Transaction request"
      subTitle={
        <div className="flex items-center justify-center gap-1 dark:text-white">
          Request from{" "}
          <span className="text-primaryButtonColor dark:text-teal-500">
            {dAppHostname}
          </span>
          <span className="text-green-500 ml-1">✓</span>
        </div>
      }
      primaryButtonText="Approve"
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
              Ethereum
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Request
          </p>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
          </div>
          {isSendTransaction && (
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

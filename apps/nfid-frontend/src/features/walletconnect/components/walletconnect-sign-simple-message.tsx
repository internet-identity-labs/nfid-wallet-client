import React from "react"

import { RPCPromptTemplate } from "frontend/features/identitykit/components/templates/prompt-template"
import {
  WalletConnectSignRequestProps,
  getDAppHostname,
} from "./walletconnect-types"

interface WalletConnectSignSimpleMessageProps extends WalletConnectSignRequestProps {
  message: string
  method: string
}

/**
 * Component for displaying simple message signing requests (personal_sign, eth_sign)
 */
export const WalletConnectSignSimpleMessage: React.FC<
  WalletConnectSignSimpleMessageProps
> = ({ message, method, dAppOrigin, isLoading, onSign, onCancel, error }) => {
  const dAppHostname = getDAppHostname(dAppOrigin)

  return (
    <RPCPromptTemplate
      title={method === "eth_sign" ? "Sign hash" : "Sign message"}
      subTitle={
        <div className="flex items-center justify-center gap-1 dark:text-white">
          Request from{" "}
          <span className="text-primaryButtonColor dark:text-teal-500">
            {dAppHostname}
          </span>
          <span className="text-green-500 ml-1">✓</span>
        </div>
      }
      primaryButtonText="Sign"
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
            Message to sign
          </p>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-mono break-words whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {message}
            </p>
          </div>
        </div>
      </div>
    </RPCPromptTemplate>
  )
}

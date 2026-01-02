import React from "react"

import { RPCPromptTemplate } from "frontend/features/identitykit/components/templates/prompt-template"
import {
  WalletConnectSignRequestProps,
  getDAppHostname,
} from "./walletconnect-types"

interface WalletConnectSignTypedDataProps
  extends WalletConnectSignRequestProps {
  typedData: any
}

/**
 * Render typed data fields recursively
 */
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

/**
 * Component for displaying typed data signing requests (eth_signTypedData, eth_signTypedData_v4)
 */
export const WalletConnectSignTypedData: React.FC<
  WalletConnectSignTypedDataProps
> = ({ typedData, dAppOrigin, isLoading, onSign, onCancel, error }) => {
  const dAppHostname = getDAppHostname(dAppOrigin)

  return (
    <RPCPromptTemplate
      title="Sign typed message"
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
          </div>
        </div>
      </div>
    </RPCPromptTemplate>
  )
}

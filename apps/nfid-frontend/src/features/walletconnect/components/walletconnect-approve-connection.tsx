import React from "react"
import { SignClientTypes } from "@walletconnect/types"

import { Address } from "@nfid-frontend/ui"
import { RPCPromptTemplate } from "frontend/features/identitykit/components/templates/prompt-template"

interface WalletConnectApproveConnectionProps {
  proposal: SignClientTypes.EventArguments["session_proposal"]
  ethAddress: string | null
  onApprove: () => void
  onReject: () => void
  error?: string | null
}

export const WalletConnectApproveConnection: React.FC<
  WalletConnectApproveConnectionProps
> = ({ proposal, ethAddress, onApprove, onReject, error }) => {
  const dAppMetadata = proposal.params.proposer.metadata
  const optionalNamespaces = proposal.params.optionalNamespaces

  // Extract network information from namespaces
  const eip155Namespace = optionalNamespaces?.eip155
  const chains = eip155Namespace?.chains || []
  const networkName = chains.length > 0 ? getNetworkName(chains[0]) : "Ethereum"

  // Get dApp origin
  const dAppOrigin = dAppMetadata.url
    ? new URL(dAppMetadata.url).hostname
    : "Unknown"

  return (
    <RPCPromptTemplate
      title="Approve connection"
      subTitle={
        <div className="flex items-center justify-center gap-1 dark:text-white">
          Request from{" "}
          <span className="text-primaryButtonColor dark:text-teal-500">
            {dAppOrigin}
          </span>
          <span className="text-red-500 ml-1">⚠</span>
        </div>
      }
      primaryButtonText="Connect"
      secondaryButtonText="Cancel"
      onPrimaryButtonClick={onApprove}
      onSecondaryButtonClick={onReject}
      isPrimaryDisabled={!ethAddress}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Connect with section */}
        <div className="space-y-2">
          <p className="text-sm font-semibold dark:text-white">Connect with</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Allow this site to request payments and view your balances.
          </p>
        </div>

        {/* Network and Wallet Address */}
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium dark:text-white">Network</span>
            <div className="flex items-center gap-2">
              <span className="text-sm dark:text-white">{networkName}</span>
              {networkName === "Ethereum" && (
                <span className="text-lg">💎</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium dark:text-white">
              Wallet address
            </span>
            <Address
              address={ethAddress || ""}
              className="text-xs font-mono dark:text-white"
            />
          </div>
        </div>

        {/* Warning message */}
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-orange-500 text-lg">⚠</span>
            <p className="text-xs text-orange-800 dark:text-orange-200">
              Proceed with caution. Unable to verify the safety of this
              approval. Please make sure you trust this dapp.
            </p>
          </div>
        </div>
      </div>
    </RPCPromptTemplate>
  )
}

/**
 * Get human-readable network name from chain ID
 */
function getNetworkName(chainId: string): string {
  const chainIdMap: Record<string, string> = {
    "eip155:1": "Ethereum",
    "eip155:137": "Polygon",
    "eip155:56": "BNB Smart Chain",
    "eip155:8453": "Base",
    "eip155:42161": "Arbitrum",
    "eip155:11155111": "Sepolia",
  }

  return chainIdMap[chainId] || chainId
}

import React from "react"
import { SignClientTypes } from "@walletconnect/types"

import { Button } from "@nfid-frontend/ui"

interface WalletConnectProposalProps {
  proposal: SignClientTypes.EventArguments["session_proposal"]
  ethAddress: string | null
  isLoading: boolean
  onApprove: () => void
  onReject: () => void
}

export const WalletConnectProposal: React.FC<WalletConnectProposalProps> = ({
  proposal,
  ethAddress,
  isLoading,
  onApprove,
  onReject,
}) => {
  const dAppMetadata = proposal.params.proposer.metadata
  const requiredNamespaces = proposal.params.requiredNamespaces

  // Get all namespaces
  const namespaceKeys = Object.keys(requiredNamespaces || {})

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          WalletConnect Connection Request
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          A dApp wants to connect to your wallet:
        </p>
        <div className="p-3 bg-gray-50 rounded-lg">
          {dAppMetadata.icons && dAppMetadata.icons.length > 0 && (
            <img
              src={dAppMetadata.icons[0]}
              alt={dAppMetadata.name}
              className="w-12 h-12 rounded-lg mb-2"
            />
          )}
          <p className="font-semibold">{dAppMetadata.name}</p>
          {dAppMetadata.description && (
            <p className="text-sm text-gray-600 mt-1">
              {dAppMetadata.description}
            </p>
          )}
          {dAppMetadata.url && (
            <p className="text-xs text-gray-500 mt-1">{dAppMetadata.url}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2">Requested permissions:</p>
        <div className="p-3 bg-gray-50 rounded-lg">
          {namespaceKeys.length === 0 ? (
            <p className="text-xs text-gray-500">
              No specific permissions requested
            </p>
          ) : (
            namespaceKeys.map((namespaceKey) => {
              const namespace = requiredNamespaces[namespaceKey]
              if (!namespace) return null

              return (
                <div key={namespaceKey} className="mb-3 last:mb-0">
                  <p className="text-xs font-semibold mb-1">
                    {namespaceKey === "eip155"
                      ? "Ethereum (EIP-155)"
                      : namespaceKey}
                    :
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-2">
                    {namespace.chains && namespace.chains.length > 0 && (
                      <li>• Chains: {namespace.chains.join(", ")}</li>
                    )}
                    {namespace.methods && namespace.methods.length > 0 && (
                      <li>• Methods: {namespace.methods.join(", ")}</li>
                    )}
                    {namespace.events && namespace.events.length > 0 && (
                      <li>• Events: {namespace.events.join(", ")}</li>
                    )}
                  </ul>
                </div>
              )
            })
          )}
        </div>
      </div>

      {ethAddress && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Will connect with:</p>
          <p className="text-xs font-mono break-all">{ethAddress}</p>
        </div>
      )}

      {!ethAddress && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please login to your wallet first to connect.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button className="flex-1" onClick={onReject} disabled={isLoading}>
          Reject
        </Button>
        <Button
          className="flex-1"
          onClick={onApprove}
          disabled={isLoading || !ethAddress}
        >
          {isLoading ? "Processing..." : "Approve"}
        </Button>
      </div>
    </div>
  )
}

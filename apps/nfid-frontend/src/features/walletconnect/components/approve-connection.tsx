import React from "react"
import { CoreTypes, ProposalTypes } from "@walletconnect/types"

import { WalletConnectPromptTemplate } from "./prompt-template"
import { Card, CopyAddress, Skeleton, Tooltip } from "@nfid-frontend/ui"
import { getNetworkIcon } from "packages/ui/src/utils/network-icon"
import {
  getNetworkId,
  getNetworkName,
  getStatusIcon,
  getStatusText,
} from "../utils"
import { useDarkTheme } from "frontend/hooks"
import { ValidationStatus } from "../types"

interface WalletConnectApproveConnectionProps {
  dAppMetadata: CoreTypes.Metadata
  optionalNamespaces: ProposalTypes.OptionalNamespaces
  validationStatus: ValidationStatus
  ethAddress: string | null
  onApprove: () => Promise<void>
  onReject: () => void
  error?: string | null
}

export const WalletConnectApproveConnection: React.FC<
  WalletConnectApproveConnectionProps
> = ({
  dAppMetadata,
  optionalNamespaces,
  validationStatus,
  ethAddress,
  onApprove,
  onReject,
  error,
}) => {
  const isDarkTheme = useDarkTheme()
  const eip155Namespace = optionalNamespaces?.eip155
  const chains = eip155Namespace?.chains || []
  const networkName = chains.length > 0 ? getNetworkName(chains[0]) : "Ethereum"
  const dAppOrigin = dAppMetadata.url
    ? new URL(dAppMetadata.url).hostname
    : "Unknown"
  const { title, text } = getStatusText(validationStatus)

  return (
    <WalletConnectPromptTemplate
      title="Approve connection"
      subTitle={
        <div className="flex items-center justify-center gap-1 dark:text-white">
          <div className="flex items-center gap-1">
            <span>
              {" "}
              Request from{" "}
              <a
                href={dAppMetadata.url}
                target="_blank"
                className="no-underline text-primaryButtonColor dark:text-teal-500"
                rel="noreferrer"
              >
                {dAppOrigin}
              </a>
            </span>
            <Tooltip
              tip={
                <p>
                  <strong>{title}:</strong> {text}
                </p>
              }
              className="w-[367px] !p-[10px] text-xs leading-[18px]"
            >
              <img
                className="w-4 h-4"
                src={getStatusIcon(validationStatus)}
                alt={validationStatus}
              />
            </Tooltip>
          </div>
        </div>
      }
      primaryButtonText="Connect"
      secondaryButtonText="Cancel"
      onPrimaryButtonClick={onApprove}
      onSecondaryButtonClick={onReject}
      isPrimaryDisabled={!ethAddress}
    >
      <p className="text-sm font-bold leading-5 dark:text-white">
        Connect with
      </p>
      <p className="text-xs text-gray-500 dark:text-zinc-500 leading-[18px] my-1">
        Allow this site to request payments and view your balances.
      </p>

      <div className="flex items-center justify-between h-[54px] border-b border-gray-100 dark:border-zinc-400">
        <span className="text-sm text-gray-400 dark:text-zinc-400">
          Network
        </span>
        <div className="flex items-center gap-2">
          {getNetworkIcon(getNetworkId(chains[0]), isDarkTheme, 24)}
          <span className="text-sm dark:text-white">{networkName}</span>
        </div>
      </div>
      <div className="flex items-center justify-between h-[54px]">
        <span className="text-sm text-gray-400 dark:text-zinc-400">
          Wallet address
        </span>
        {!ethAddress ? (
          <Skeleton className="w-[80px] h-4" />
        ) : (
          <CopyAddress
            className="text-sm dark:text-white"
            address={ethAddress || ""}
            leadingChars={6}
            trailingChars={4}
            iconClassName="absolute right-[100%] mr-[3px]"
          />
        )}
      </div>
      <Card
        title="Proceed with caution."
        text="Unable to verify the safety of this
              approval. Please make sure you trust this dapp."
      />
      {error && (
        <div className="text-xs leading-4 text-center text-red-600 dark:text-red-500 tracking-[0.16px]">
          {error}
        </div>
      )}
    </WalletConnectPromptTemplate>
  )
}

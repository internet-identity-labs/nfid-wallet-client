import clsx from "clsx"
import React from "react"

import { Tooltip } from "@nfid/ui"
import { getNetworkIcon } from "@nfid/ui/utils/network-icon"

import { useDarkTheme } from "frontend/hooks"

import { ValidationStatus, WalletConnectSignRequestProps } from "../types"
import {
  getDAppHostname,
  getNetworkId,
  getNetworkName,
  getStatusIcon,
  getStatusText,
} from "../utils"

import { WalletConnectPromptTemplate } from "./prompt-template"

interface WalletConnectSignSimpleMessageProps extends WalletConnectSignRequestProps {
  message: string
  method: string
  validationStatus: ValidationStatus
  chainId: string
}

export const WalletConnectSignSimpleMessage: React.FC<
  WalletConnectSignSimpleMessageProps
> = ({
  message,
  method,
  dAppOrigin,
  isLoading,
  onSign,
  onCancel,
  error,
  validationStatus,
  chainId,
}) => {
  const isDarkTheme = useDarkTheme()
  const networkName = getNetworkName(chainId)
  const dAppHostname = getDAppHostname(dAppOrigin)
  const { title, text } = getStatusText(validationStatus)

  return (
    <WalletConnectPromptTemplate
      title={method === "eth_sign" ? "Sign hash" : "Sign message"}
      subTitle={
        <div className="flex items-center justify-center gap-1 dark:text-white">
          Request from{" "}
          <a
            href={dAppOrigin}
            target="_blank"
            className="no-underline text-primaryButtonColor dark:text-teal-500"
            rel="noreferrer"
          >
            {dAppHostname}
          </a>
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
      }
      primaryButtonText="Sign"
      secondaryButtonText="Cancel"
      onPrimaryButtonClick={onSign}
      onSecondaryButtonClick={onCancel}
      isPrimaryDisabled={isLoading || !!error}
    >
      <div className="flex items-center justify-between h-[54px] border-b border-gray-100 dark:border-zinc-400">
        <span className="text-sm text-gray-400 dark:text-zinc-400">
          Network
        </span>
        <div className="flex items-center gap-2">
          {getNetworkIcon(getNetworkId(chainId), isDarkTheme, 24)}
          <span className="text-sm dark:text-white">{networkName}</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 dark:text-zinc-400 pt-[18px] pb-[10px]">
        Message to sign
      </p>
      <div className="bg-white border border-gray-200 rounded-[12px] dark:border-zinc-400 overflow-hidden">
        <div
          className={clsx(
            "p-[14px] h-[176px] dark:bg-zinc-800",
            "flex-1 overflow-auto snap-end pr-[10px]",
            "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-[12px]",
            "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-800",
          )}
        >
          <p className="text-sm leading-[18px] text-gray-500 break-words whitespace-pre-wrap dark:text-zinc-500">
            {message}
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-1 text-xs leading-4 text-center text-red-600 dark:text-red-500 tracking-[0.16px] break-all">
          {error}
        </div>
      )}
    </WalletConnectPromptTemplate>
  )
}

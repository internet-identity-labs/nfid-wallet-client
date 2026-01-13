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
  renderTypedDataFields,
} from "../utils"

import { WalletConnectPromptTemplate } from "./prompt-template"

interface WalletConnectSignTypedDataProps extends WalletConnectSignRequestProps {
  typedData: any
  validationStatus: ValidationStatus
  chainId: string
}

export const WalletConnectSignTypedData: React.FC<
  WalletConnectSignTypedDataProps
> = ({
  validationStatus,
  chainId,
  typedData,
  dAppOrigin,
  isLoading,
  onSign,
  onCancel,
  error,
}) => {
  const isDarkTheme = useDarkTheme()
  const networkName = getNetworkName(chainId)
  const dAppHostname = getDAppHostname(dAppOrigin)
  const { title, text } = getStatusText(validationStatus)

  return (
    <WalletConnectPromptTemplate
      title="Sign typed message"
      subTitle={
        <div className="flex items-center justify-center gap-1 dark:text-white">
          Request from{" "}
          <span className="text-primaryButtonColor dark:text-teal-500">
            {dAppHostname}
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
            "px-[14px] py-2 h-[176px] dark:bg-zinc-800",
            "flex-1 overflow-auto snap-end pr-[10px]",
            "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-[12px]",
            "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-800",
          )}
        >
          <div>
            {Object.entries(typedData).map(([key, value]) => {
              if (key === "types" || key === "primaryType") {
                return null
              }

              return (
                <div
                  key={key}
                  className="text-sm leading-5 text-gray-500 dark:text-zinc-400"
                >
                  <div className="font-bold py-1.5">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  {typeof value === "object" && value !== null ? (
                    <div className="ml-[10px]">
                      {renderTypedDataFields(value)}
                    </div>
                  ) : (
                    <div className="ml-2">
                      <span className="break-all">{String(value)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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

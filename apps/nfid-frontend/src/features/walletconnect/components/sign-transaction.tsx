import React, { useEffect, useState } from "react"
import BigNumber from "bignumber.js"

import { WalletConnectPromptTemplate } from "./prompt-template"
import {
  EthereumTransactionParams,
  ValidationStatus,
  WalletConnectSignRequestProps,
} from "../types"
import {
  formatUsdPrice,
  formatValue,
  getDAppHostname,
  getNetworkId,
  getNetworkName,
  getStatusIcon,
  getStatusText,
} from "../utils"

import { useDarkTheme } from "frontend/hooks"
import { CopyAddress, Skeleton, Tooltip } from "@nfid-frontend/ui"
import { getNetworkIcon } from "packages/ui/src/utils/network-icon"
import { exchangeRateService } from "@nfid/integration"
import { CKETH_LEDGER_CANISTER_ID } from "@nfid/integration/token/constants"

interface WalletConnectSignTransactionProps extends WalletConnectSignRequestProps {
  transaction: EthereumTransactionParams
  validationStatus: ValidationStatus
  chainId: string
}

export const WalletConnectSignTransaction: React.FC<
  WalletConnectSignTransactionProps
> = ({
  validationStatus,
  chainId,
  transaction,
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
  const [usdRate, setUsdRate] = useState<BigNumber>()

  console.log("transaction", transaction)

  useEffect(() => {
    const getEthrate = async () => {
      const ethRate = await exchangeRateService.usdPriceForICRC1(
        CKETH_LEDGER_CANISTER_ID,
      )

      if (ethRate !== null) {
        setUsdRate(ethRate.value)
      }
    }

    getEthrate()
  }, [])

  return (
    <WalletConnectPromptTemplate
      title="Approve transaction"
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
      onPrimaryButtonClick={onSign}
      onSecondaryButtonClick={onCancel}
      isPrimaryDisabled={isLoading || !!error}
    >
      {transaction.value !== undefined && (
        <div className="text-center mb-[40px]">
          <p className="text-[32px] leading-[26px] font-medium tracking-[0.01em] dark:text-white">
            {formatValue(transaction.value)}
          </p>
          {usdRate ? (
            <p className="text-sm leading-5 text-gray-400 dark:text-zinc-400">
              {formatUsdPrice(usdRate, transaction.value)}
            </p>
          ) : (
            <Skeleton className="w-[80px] h-4 mt-1 mx-auto" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between h-[54px] border-b border-gray-100 dark:border-zinc-400">
        <span className="text-sm text-gray-400 dark:text-zinc-400">To</span>
        <div className="flex items-center gap-2">
          <CopyAddress
            className="text-sm dark:text-white"
            address={transaction.to || ""}
            leadingChars={6}
            trailingChars={4}
            iconClassName="absolute right-[100%] mr-[3px]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between h-[54px] border-b border-gray-100 dark:border-zinc-400">
        <span className="text-sm text-gray-400 dark:text-zinc-400">
          Network
        </span>
        <div className="flex items-center gap-2">
          {getNetworkIcon(getNetworkId(chainId), isDarkTheme, 24)}
          <span className="text-sm dark:text-white">{networkName}</span>
        </div>
      </div>
      <div className="flex items-center justify-between h-[54px] border-b border-gray-400 dark:border-zinc-400">
        <span className="text-sm text-gray-400 dark:text-zinc-400">
          Network fee
        </span>
        <div className="text-right">
          <p className="text-sm leading-5 dark:text-white">
            {formatValue(String(transaction.gas || transaction.gasLimit))}
            {/* gasLimit +  */}
          </p>
          {usdRate ? (
            <p className="text-xs leading-5 text-gray-400 dark:text-zinc-400">
              {formatUsdPrice(
                usdRate,
                String(transaction.gas || transaction.gasLimit),
              )}
            </p>
          ) : (
            <Skeleton className="w-[80px] h-4 mt-1 ml-auto" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between h-[54px]">
        <span className="text-sm font-bold text-black dark:text-white">
          Total
        </span>
        <div className="text-right">
          <p className="text-sm font-bold leading-5 dark:text-white">
            {formatValue(String(transaction.gas || transaction.gasLimit))}
          </p>
          {usdRate ? (
            <p className="text-xs leading-5 text-gray-400 dark:text-zinc-400">
              {formatUsdPrice(
                usdRate,
                String(transaction.gas || transaction.gasLimit),
              )}
            </p>
          ) : (
            <Skeleton className="w-[80px] h-4 mt-1 ml-auto" />
          )}
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

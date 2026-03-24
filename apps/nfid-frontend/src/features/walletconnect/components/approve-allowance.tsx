import React, { useEffect, useState } from "react"
import BigNumber from "bignumber.js"

import { WalletConnectPromptTemplate } from "./prompt-template"
import {
  EthereumTransactionParams,
  ValidationStatus,
  WalletConnectSignRequestProps,
  WCGasData,
} from "../types"
import {
  decodeAllowanceData,
  formatGasPrice,
  formatUsdPrice,
  getDAppHostname,
  getNetworkId,
  getNetworkName,
  getStatusIcon,
  getStatusText,
} from "../utils"
import { useDarkTheme } from "frontend/hooks"
import { Card, CopyAddress, Skeleton, Tooltip } from "@nfid-frontend/ui"
import { getNetworkIcon } from "packages/ui/src/utils/network-icon"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { polygonErc20Service } from "frontend/integration/ethereum/polygon/pol-erc20.service"
import { ethErc20Service } from "frontend/integration/ethereum/eth/eth-erc20.service"
import { baseErc20Service } from "frontend/integration/ethereum/base/base-erc20.service"
import { arbitrumErc20Service } from "frontend/integration/ethereum/arbitrum/arbitrum-erc20.service"
import {
  CKETH_LEDGER_CANISTER_ID,
  POLYGON_ADDRESS,
} from "@nfid/integration/token/constants"
import { exchangeRateService } from "@nfid/integration"
import { WalletConnectTransactionData } from "./transaction-data"

interface WalletConnectApproveAllowanceProps extends WalletConnectSignRequestProps {
  transaction: EthereumTransactionParams
  validationStatus: ValidationStatus
  chainId: string
  fee?: WCGasData
  ethAddress: string | null
}

const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
)

export const WalletConnectApproveAllowance: React.FC<
  WalletConnectApproveAllowanceProps
> = ({
  validationStatus,
  chainId,
  transaction,
  dAppOrigin,
  isLoading,
  onSign,
  onCancel,
  error,
  fee,
  ethAddress,
}) => {
  const isDarkTheme = useDarkTheme()
  const networkName = getNetworkName(chainId)
  const dAppHostname = getDAppHostname(dAppOrigin)
  const allowance = decodeAllowanceData(transaction.data)
  const { title, text } = getStatusText(validationStatus)
  const [usdRate, setUsdRate] = useState<BigNumber>()
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string
    decimals: number
  } | null>(null)

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!transaction.to) return
      const network = getNetworkId(chainId)
      const service =
        network === ChainId.POL
          ? polygonErc20Service
          : network === ChainId.BASE
            ? baseErc20Service
            : network === ChainId.ARB
              ? arbitrumErc20Service
              : ethErc20Service
      const tokens = await service.getTokensList()
      const token = tokens.find(
        (t) => t.address.toLowerCase() === transaction.to!.toLowerCase(),
      )
      if (token)
        setTokenInfo({ symbol: token.symbol, decimals: token.decimals })
    }
    fetchTokenInfo()
  }, [chainId, transaction.to])

  const formattedAllowanceAmount = (() => {
    if (!allowance) return undefined
    if (allowance.amount === MAX_UINT256) return "Unlimited"
    if (!tokenInfo) return allowance.amount.toString()
    const formatted = new BigNumber(allowance.amount.toString())
      .dividedBy(new BigNumber(10).pow(tokenInfo.decimals))
      .toFormat()
    return `${formatted} ${tokenInfo.symbol}`
  })()
  const formattedGas = formatGasPrice(
    fee?.total.toString(),
    getNetworkId(chainId),
  )
  const formattedGasUsd = formatUsdPrice(usdRate, fee?.total.toString())

  useEffect(() => {
    const getEthRate = async () => {
      const network = getNetworkId(chainId)
      if (network === ChainId.POL) {
        const prices = await polygonErc20Service.getUSDPrices([POLYGON_ADDRESS])
        const polRate = new BigNumber(prices[0].price)
        setUsdRate(polRate)
      } else {
        const ethRate = await exchangeRateService.usdPriceForICRC1(
          CKETH_LEDGER_CANISTER_ID,
        )

        if (ethRate !== null) {
          setUsdRate(ethRate.value)
        }
      }
    }

    getEthRate()
  }, [chainId])

  return (
    <WalletConnectPromptTemplate
      title="Approve allowance"
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
      <WalletConnectTransactionData
        address={ethAddress || ""}
        token={formattedAllowanceAmount || ""}
      />
      {formattedAllowanceAmount !== undefined && (
        <div className="text-center mb-[40px]">
          <p className="text-[32px] leading-[26px] font-medium tracking-[0.01em] dark:text-white">
            {formattedAllowanceAmount}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between h-[54px] border-b border-gray-100 dark:border-zinc-400">
        <span className="text-sm dark:text-white">Network</span>
        <div className="flex items-center gap-2">
          {getNetworkIcon(getNetworkId(chainId), isDarkTheme, 24)}
          <span className="text-sm dark:text-white">{networkName}</span>
        </div>
      </div>
      <div className="flex items-center justify-between h-[54px] border-b border-gray-100 dark:border-zinc-400">
        <span className="text-sm dark:text-white">To</span>
        <div className="flex items-center gap-2">
          <CopyAddress
            className="text-sm dark:text-white"
            address={allowance?.spender || ""}
            leadingChars={6}
            trailingChars={4}
            iconClassName="absolute right-[100%] mr-[3px]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between h-[54px] border-b border-gray-400 dark:border-zinc-100">
        <span className="text-sm dark:text-white">Network fee</span>
        <div className="text-right">
          {formattedGas ? (
            <p className="text-sm leading-5 dark:text-white">{formattedGas}</p>
          ) : (
            <Skeleton className="w-[120px] h-4 mb-1 ml-auto" />
          )}

          {usdRate && formattedGasUsd ? (
            <p className="text-xs leading-5 text-gray-400 dark:text-zinc-400">
              {formattedGasUsd}
            </p>
          ) : (
            <Skeleton className="w-[80px] h-4 mt-1 ml-auto" />
          )}
        </div>
      </div>
      <Card
        title="Proceed with caution."
        text="Unable to verify the safety of this
                    approval. Please make sure you trust this dapp."
      />
      {error && (
        <div className="mt-1 text-xs leading-4 text-center text-red-600 dark:text-red-500 tracking-[0.16px] break-all">
          {error}
        </div>
      )}
    </WalletConnectPromptTemplate>
  )
}

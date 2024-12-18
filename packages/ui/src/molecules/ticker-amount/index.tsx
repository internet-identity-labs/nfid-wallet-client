import BigNumber from "bignumber.js"
import React from "react"

import {
  MAX_DECIMAL_USD_LENGTH,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"

interface TickerAmountProps {
  symbol: string
  value: number | string
  decimals?: number
  usdRate?: number | string
  withUSDSymbol?: boolean
}

const checkUsd = (value: BigNumber): string =>
  value.lt(0.01)
    ? `0.00 USD`
    : value.toFixed(MAX_DECIMAL_USD_LENGTH).replace(TRIM_ZEROS, "") + " USD"

const formatUsdAmountNoDecimals = (value: BigNumber, rate: BigNumber): string =>
  checkUsd(value.multipliedBy(rate))

const formatUsdAmount = (
  value: BigNumber,
  decimals: number,
  rate: BigNumber,
): string => checkUsd(value.div(10 ** decimals).multipliedBy(rate))

const formatAssetAmount = (
  symbol: string,
  value: BigNumber,
  decimals: number,
): string =>
  value
    .div(10 ** decimals)
    .toFixed(decimals)
    .replace(TRIM_ZEROS, "") + ` ${symbol}`

export const formatAssetAmountRaw = (
  value: BigNumber,
  decimals: number,
): string => {
  return value
    .div(10 ** decimals)
    .toFixed(decimals)
    .replace(TRIM_ZEROS, "")
}

export const TickerAmount: React.FC<TickerAmountProps> = ({
  symbol,
  value,
  decimals,
  usdRate,
}) => {
  if (!decimals) {
    return (
      <>{formatUsdAmountNoDecimals(BigNumber(value), BigNumber(usdRate!))}</>
    )
  }

  if (usdRate) {
    return (
      <>{formatUsdAmount(BigNumber(value), decimals, BigNumber(usdRate))}</>
    )
  }

  return <>{formatAssetAmount(symbol, BigNumber(value), decimals)}</>
}

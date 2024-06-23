import React from "react"

import {
  MAX_DECIMAL_LENGTH,
  MAX_DECIMAL_USD_LENGTH,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"

interface TickerAmountProps {
  symbol: string
  value: number
  decimals?: number
  usdRate?: number
}

const checkUsd = (value: number): string =>
  value < 0.01
    ? "0.00 USD"
    : value.toFixed(MAX_DECIMAL_USD_LENGTH).replace(TRIM_ZEROS, "") + " USD"

const formatUsdAmountNoDecimals = (value: number, rate: number): string =>
  checkUsd(value * rate)

const formatUsdAmount = (
  value: number,
  decimals: number,
  rate: number,
): string => checkUsd((value / 10 ** decimals) * rate)

const formatAssetAmount = (
  symbol: string,
  value: number,
  decimals: number,
): string =>
  (value / 10 ** decimals).toFixed(MAX_DECIMAL_LENGTH).replace(TRIM_ZEROS, "") +
  ` ${symbol}`

export const formatAssetAmountRaw = (
  value: number,
  decimals: number,
): string => {
  return (value / 10 ** decimals)
    .toFixed(MAX_DECIMAL_LENGTH)
    .replace(TRIM_ZEROS, "")
}
export const TickerAmount: React.FC<TickerAmountProps> = ({
  symbol,
  value,
  decimals,
  usdRate,
}) => {
  if (!decimals) {
    return <>{formatUsdAmountNoDecimals(value, usdRate!)}</>
  }

  if (usdRate) {
    return <>{formatUsdAmount(+value, decimals, usdRate)}</>
  }

  return <>{formatAssetAmount(symbol, +value, decimals)}</>
}

import React from "react"

import {
  MAX_DECIMAL_USD_LENGTH,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"

interface TickerAmountProps {
  symbol: string
  value: number
  decimals?: number
  usdRate?: number
  withUSDSymbol?: boolean
}

const truncateToDecimals = (value: number, dec: number) => {
  const calcDec = Math.pow(10, dec)
  return Math.trunc(value * calcDec) / calcDec
}

const checkUsd = (value: number, withUSDSymbol: boolean): string =>
  value < 0.01
    ? `0.00${withUSDSymbol ? " USD" : ""}`
    : value.toFixed(MAX_DECIMAL_USD_LENGTH).replace(TRIM_ZEROS, "") +
      (withUSDSymbol ? " USD" : "")

const formatUsdAmountNoDecimals = (value: number, rate: number): string =>
  checkUsd(value * rate, true)

const formatUsdAmount = (
  value: number,
  decimals: number,
  rate: number,
  withUSDSymbol: boolean,
): string => checkUsd((value / 10 ** decimals) * rate, withUSDSymbol)

const formatAssetAmount = (
  symbol: string,
  value: number,
  decimals: number,
): string =>
  (value / 10 ** decimals).toFixed(decimals).replace(TRIM_ZEROS, "") +
  ` ${symbol}`

export const formatAssetAmountRaw = (
  value: number,
  decimals: number,
): string => {
  const amount = value / 10 ** decimals

  return truncateToDecimals(amount, decimals).toString()
}

export const TickerAmount: React.FC<TickerAmountProps> = ({
  symbol,
  value,
  decimals,
  usdRate,
  withUSDSymbol = true,
}) => {
  if (!decimals) {
    return <>{formatUsdAmountNoDecimals(value, usdRate!)}</>
  }

  if (usdRate) {
    return <>{formatUsdAmount(+value, decimals, usdRate, withUSDSymbol)}</>
  }

  return <>{formatAssetAmount(symbol, +value, decimals)}</>
}

import { useMemo } from "react"
import useSWR from "swr"

const COINBASE_RATES_URL = `https://api.coinbase.com/v2/exchange-rates`
const NOT_AVAILABLE = ""
const DEFAULT_EXCHANGE_RATES = ["ICP", "ETH", "BTC"]
export interface IRate {
  [currency: string]: number
}

export const useExchangeRates = (tokens = DEFAULT_EXCHANGE_RATES) => {
  const { data: prices, ...rest } = useSWR("exchangeRates", () =>
    fetch(COINBASE_RATES_URL).then((res) => res.json()),
  )

  const rates: IRate = useMemo(() => {
    if (!prices?.data || !tokens) return {}

    return tokens.reduce((acc, token, index) => {
      const priceInToken = prices?.data?.rates[token]
      const priceInUsd = priceInToken
        ? (1 / priceInToken).toFixed(2)
        : NOT_AVAILABLE

      acc[token] = Number(parseFloat(priceInUsd).toFixed(2))
      return acc
    }, {} as IRate)
  }, [prices, tokens])

  return { rates, prices, ...rest }
}

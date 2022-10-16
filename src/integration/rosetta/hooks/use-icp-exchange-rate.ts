import useSWR from "swr"

import { getExchangeRate } from ".."

export const useICPExchangeRate = () => {
  const { data: exchangeRate, ...rest } = useSWR(
    "walletExchangeRate",
    getExchangeRate,
    {
      dedupingInterval: 60_000 * 60,
      focusThrottleInterval: 60_000 * 60,
      refreshInterval: 60_000 * 60,
    },
  )
  return {
    exchangeRate,
    ...rest,
  }
}

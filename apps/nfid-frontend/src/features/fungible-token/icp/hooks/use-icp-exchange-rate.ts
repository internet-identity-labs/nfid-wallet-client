import { useSWR } from "@nfid/swr"

import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"

export const useICPExchangeRate = () => {
  const { data: exchangeRate, ...rest } = useSWR(
    "walletExchangeRate",
    getExchangeRate.bind(null, "ICP"),
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

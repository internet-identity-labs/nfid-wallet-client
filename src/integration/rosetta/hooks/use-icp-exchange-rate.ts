import useSWR from "swr"

import { getExchangeRate } from ".."

export const useICPExchangeRate = () => {
  const { data: exchangeRate, ...rest } = useSWR(
    "walletExchangeRate",
    getExchangeRate,
    { dedupingInterval: 60000 * 60, refreshInterval: 60000 * 60 },
  )
  return {
    exchangeRate,
    ...rest,
  }
}

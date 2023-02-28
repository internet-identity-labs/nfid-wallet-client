import useSWR from "swr"

import { getAllEthBalances } from "./get-all-balances"

export const useEthBalances = () => {
  const { data: balances, ...rest } = useSWR(
    "ethereumBalances",
    getAllEthBalances,
  )

  return { balances, ...rest }
}

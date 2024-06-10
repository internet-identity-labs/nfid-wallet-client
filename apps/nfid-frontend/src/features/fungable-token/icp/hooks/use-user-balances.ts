import useSWR from "swr"

import { fetchBalances } from "frontend/features/fungable-token/fetch-balances"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

export const useUserBalances = () => {
  const { principals } = useAllPrincipals()

  const {
    data: balances,
    isValidating: isLoading,
    mutate: refreshBalances,
  } = useSWR(
    principals ? [`AllBalanceRaw`, principals] : null,
    async ([_, principals]) => {
      console.debug("AllBalanceRaw", { principals })
      return await fetchBalances({
        principals,
      })
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return { balances: balances, isLoading, refreshBalances }
}

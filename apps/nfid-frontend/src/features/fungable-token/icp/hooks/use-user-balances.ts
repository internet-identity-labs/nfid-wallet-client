import useSWR from "swr"

import { fetchBalances } from "frontend/features/fungable-token/fetch-balances"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

import { useAllDip20Token } from "../../dip-20/hooks/use-all-token-meta"

export const useUserBalances = () => {
  const { principals } = useAllPrincipals()
  const { token: dip20Token } = useAllDip20Token()

  const {
    data: balances,
    isValidating: isLoading,
    mutate: refreshBalances,
  } = useSWR(
    dip20Token && principals ? [`AllBalanceRaw`, principals, dip20Token] : null,
    async ([_, principals, dip20Token]) => {
      console.debug("AllBalanceRaw", { principals, dip20Token })
      return await fetchBalances({
        principals,
        dip20Token,
      })
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return { balances: balances, isLoading, refreshBalances }
}

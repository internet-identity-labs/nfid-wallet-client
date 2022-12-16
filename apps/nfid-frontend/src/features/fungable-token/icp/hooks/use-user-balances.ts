import useSWR from "swr"

import { fetchBalances } from "@nfid/integration/token/fetch-balances"

import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

import { useAllTokenMeta } from "../../dip-20/hooks/use-all-token-meta"

export const useUserBalances = () => {
  const { principals } = useAllPrincipals()
  const { token: dip20Token } = useAllTokenMeta()
  console.debug("useUserBalances", { dip20Token })

  const { data: balances, isValidating: isLoadingPrincipals } = useSWR(
    dip20Token && principals ? [principals, dip20Token, `AllBalanceRaw`] : null,
    async ([principals, dip20Token]) => {
      console.debug("AllBalanceRaw", { principals, dip20Token })
      return await fetchBalances({ principals, dip20Token })
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return { balances: balances, isLoadingPrincipals }
}

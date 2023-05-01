import { useErc20 } from "src/features/fungable-token/erc-20/hooks/use-erc-20"
import { useErc20Polygon } from "src/features/fungable-token/erc-20/hooks/use-erc-20-polygon"
import useSWR from "swr"

import { fetchBalances } from "frontend/features/fungable-token/fetch-balances"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

import { useAllDip20Token } from "../../dip-20/hooks/use-all-token-meta"

export const useUserBalances = () => {
  const { principals } = useAllPrincipals()
  const { token: dip20Token } = useAllDip20Token()
  const { erc20 } = useErc20()
  const { erc20: erc20Polygon } = useErc20Polygon()
  const {
    data: balances,
    isValidating: isLoading,
    mutate: refreshBalances,
  } = useSWR(
    dip20Token && principals && erc20 && erc20Polygon
      ? [principals, dip20Token, erc20, erc20Polygon, `AllBalanceRaw`]
      : null,
    async ([principals, dip20Token]) => {
      console.debug("AllBalanceRaw", { principals, dip20Token, erc20 })
      return await fetchBalances({
        principals,
        dip20Token,
        erc20: erc20 ? erc20 : [],
        erc20Polygon: erc20Polygon ? erc20Polygon : [],
      })
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return { balances: balances, isLoading, refreshBalances }
}

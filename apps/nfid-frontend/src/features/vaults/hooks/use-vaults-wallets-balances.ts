import useSWR from "swr"

import { getVaults, getWallets, ObjectState } from "@nfid/integration"
import { fetchVaultsWalletsBalances } from "@nfid/integration/token/fetch-balances"

export const useAllVaultsWallets = () => {
  const { data: allVaultsWallets, isLoading: isAllWalletsLoading } = useSWR(
    "allVaultsWallets",
    async () => {
      const vaults = await getVaults()

      const promisesArray = vaults?.map(async (vault) => {
        return await getWallets(vault.id)
      })

      return (await Promise.all(promisesArray))
        .flat(1)
        .filter((wallet) => wallet.state !== ObjectState.ARCHIVED)
    },
  )

  const { data: balances, isValidating: isBalancesLoading } = useSWR(
    allVaultsWallets ? [allVaultsWallets, `allVaultsWalletsBalances`] : null,
    async ([allVaultsWallets]) => {
      console.log("allVaultsWalletsBalances", { allVaultsWallets })
      return await fetchVaultsWalletsBalances(allVaultsWallets)
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return {
    balances,
    isLoading: isAllWalletsLoading || isBalancesLoading,
  }
}

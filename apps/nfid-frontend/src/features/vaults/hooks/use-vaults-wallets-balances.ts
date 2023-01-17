import useSWR from "swr"

import { getVaults, getWallets, ObjectState } from "@nfid/integration"
import { fetchVaultsWalletsBalances } from "@nfid/integration/token/fetch-balances"

import { useProfile } from "frontend/integration/identity-manager/queries"

import { useVaultDelegation } from "./use-vault-delegation"

export const useAllVaultsWallets = () => {
  const { profile } = useProfile()
  const { data: vaultDelegation } = useVaultDelegation(profile?.anchor)

  const { data: allVaultsWallets, isLoading: isAllWalletsLoading } = useSWR(
    vaultDelegation ? "allVaultsWallets" : null,
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
      console.debug("allVaultsWalletsBalances", { allVaultsWallets })
      return await fetchVaultsWalletsBalances(allVaultsWallets)
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return {
    balances,
    isLoading: isAllWalletsLoading || isBalancesLoading,
  }
}

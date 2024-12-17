import { useSWR } from "@nfid/swr"

import { getVaults, getWallets, ObjectState } from "@nfid/integration"

import { fetchVaultsWalletsBalances } from "frontend/features/fungible-token/fetch-balances"

import { useVaultDelegation } from "./use-vault-delegation"

export const useAllVaultsWallets = () => {
  const { data: vaultDelegation } = useVaultDelegation()

  const { data: allVaultsWallets, isLoading: isAllWalletsLoading } = useSWR(
    vaultDelegation ? "allVaultsWallets" : null,
    async () => {
      const vaults = await getVaults()

      const promisesArray = vaults?.map(async (vault) => {
        const result = await getWallets(vault.id)
        return result.map((wallet) => ({
          ...wallet,
          vaultId: vault.id,
          vaultName: vault.name,
        }))
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

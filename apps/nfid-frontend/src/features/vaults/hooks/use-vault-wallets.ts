import { useParams } from "react-router-dom"
import useSWR from "swr"

import { getWallets } from "@nfid/integration"
import { fetchVaultWalletsBalances } from "@nfid/integration/token/fetch-balances"

export const useVaultWallets = () => {
  const { vaultId } = useParams()

  const {
    data: wallets,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(vaultId ? `vault_${vaultId}_wallets` : null, () =>
    getWallets(BigInt(vaultId ?? "")),
  )

  const { data: walletsWithBalances, isValidating: isBalancesLoading } = useSWR(
    wallets ? [wallets, `useVaultWallets`] : null,
    async ([wallets]) => {
      console.log("useVaultWallets", { wallets })
      return await fetchVaultWalletsBalances(wallets)
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return {
    vaultId,
    isFetching: isLoading || isValidating || isBalancesLoading,
    refetch: mutate,
    wallets: walletsWithBalances,
  }
}

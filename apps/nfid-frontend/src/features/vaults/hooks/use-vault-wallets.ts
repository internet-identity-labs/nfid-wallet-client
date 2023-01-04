import { useParams } from "react-router-dom"
import useSWR from "swr"

import { getWallets } from "@nfid/integration"

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

  return {
    vaultId,
    isFetching: isLoading || isValidating,
    refetch: mutate,
    wallets,
  }
}

import { useParams } from "react-router-dom"
import useSWR from "swr"

import { getTransactions } from "@nfid/integration"

export const useVaultTransactions = () => {
  const { vaultId } = useParams()

  const { data, isLoading, isValidating, mutate } = useSWR(
    vaultId ? `vault_${vaultId}_transactions` : null,
    () => getTransactions(),
  )

  return {
    vaultId,
    isFetching: isLoading || isValidating,
    refetch: mutate,
    transactions: data,
  }
}

import { useMemo } from "react"
import { useParams } from "react-router-dom"
import useSWR from "swr"

import { getTransactions } from "@nfid/integration"

export const useVaultTransactions = () => {
  const { vaultId } = useParams()

  const {
    data: allTransactions,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(vaultId ? `vault_${vaultId}_transactions` : null, () =>
    getTransactions(),
  )

  const transactions = useMemo(() => {
    return allTransactions?.filter(
      (transaction) => transaction.vaultId === BigInt(vaultId ?? 0),
    )
  }, [allTransactions, vaultId])

  return {
    allTransactions,
    isFetching: isLoading || isValidating,
    refetch: mutate,
    transactions,
  }
}

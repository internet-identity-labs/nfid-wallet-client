import useSWR from "swr"

import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { getAllTransactionHistory } from "frontend/integration/rosetta/transactions/get-all-transaction-history"

export const useAllTransactions = () => {
  const { principals } = useAllPrincipals()

  const { data: transactions, isValidating: isWalletTransactionsLoading } =
    useSWR(
      principals
        ? [principals.map(({ principal }) => principal), "allTransactions"]
        : null,
      (principals) => getAllTransactionHistory(principals),
      {
        dedupingInterval: 30_000,
        focusThrottleInterval: 30_000,
      },
    )

  console.debug("useAllTransactions", {
    transactions,
    isWalletTransactionsLoading,
  })

  return { transactions, isWalletTransactionsLoading }
}

import { Principal } from "@dfinity/principal"
import React from "react"
import useSWR from "swr"

import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { getTransactionHistory } from "frontend/integration/rosetta"
import { TransactionHistory } from "frontend/integration/rosetta/rosetta_interface"

export const reduceAllTransactions = (transactions: TransactionHistory[]) => {
  return transactions.reduce<TransactionHistory>(
    (acc, transaction) => {
      return {
        totalCount: acc.totalCount + transaction.totalCount,
        transactions: [...acc.transactions, ...transaction.transactions],
      }
    },
    { totalCount: 0, transactions: [] } as TransactionHistory,
  )
}

export const useAllTransactions = () => {
  const { principals } = useAllPrincipals()

  const { data: rawTransactions, isValidating: isWalletTransactionsLoading } =
    useSWR(
      principals ? ["allTransactions", principals] : null,
      (_, principals) =>
        Promise.all(
          principals?.map(({ principal }) =>
            getTransactionHistory(principal as Principal),
          ),
        ),
    )

  const transactions = React.useMemo(
    () => (rawTransactions ? reduceAllTransactions(rawTransactions) : null),
    [rawTransactions],
  )

  console.debug("useAllTransactions", { transactions, rawTransactions })

  return { transactions, isWalletTransactionsLoading }
}

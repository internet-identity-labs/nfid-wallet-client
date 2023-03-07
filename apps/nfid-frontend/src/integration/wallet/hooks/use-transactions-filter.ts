import React from "react"

import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

import { useAllTransactions } from "./get-all-transactions"
import { reduceTransactionFilterOptions } from "./reduce-transaction-filter-options"

export interface UseTransactionsFilterProps {
  excludeEmpty?: boolean
  includeAddresses?: string[]
  btcData?: BtcTransactionData
}

export interface BtcTransactionData {
  transactions?: number
  value?: string
}

export const useTransactionsFilter = ({
  excludeEmpty = true,
  includeAddresses = [],
  btcData,
}: UseTransactionsFilterProps) => {
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()
  const { transactions } = useAllTransactions()
  const transactionsFilterOptions = React.useMemo(
    () =>
      principals && applicationsMeta && transactions
        ? reduceTransactionFilterOptions(
            principals,
            applicationsMeta,
            transactions.transactions,
            btcData,
          ).filter((t) =>
            excludeEmpty
              ? Number(t.afterLabel) > 0 ||
                includeAddresses.indexOf(t.value) > -1
              : true,
          )
        : [],
    [
      principals,
      applicationsMeta,
      transactions,
      excludeEmpty,
      includeAddresses,
      btcData
    ],
  )

  return { transactionsFilterOptions }
}

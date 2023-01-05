import React, { useCallback, useMemo, useState } from "react"

import {
  EmptyCard,
  IconCmpFilters,
  IconCmpSorting,
  IconCmpTransactions,
} from "@nfid-frontend/ui"
import { Transaction } from "@nfid/integration"

import { VaultActionBar } from "../../action-bar"
import { useVaultTransactions } from "../../hooks/use-vault-transactions"
import { VaultsTransactionsTable } from "./table"

interface VaultsTransactionsPageProps {}

export const VaultsTransactionsPage: React.FC<
  VaultsTransactionsPageProps
> = () => {
  const [searchFilter, setSearchFilter] = useState("")
  const { transactions, isFetching } = useVaultTransactions()

  const filteredTransactions: Transaction[] = useMemo(() => {
    if (!transactions) return []

    return transactions
      .filter((transaction) => transaction?.owner.includes(searchFilter))
      .sort((a, b) => a.state.localeCompare(b.state))
  }, [transactions, searchFilter])

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(e.target.value)
    },
    [],
  )

  return (
    <div className="border border-gray-200 rounded-xl mt-[30px]">
      <VaultActionBar
        onInputChange={onFilterChange}
        actionButtons={
          <div className="flex items-center justify-start w-full ml-4 space-x-5">
            <IconCmpFilters className="transition-opacity cursor-pointer hover:opacity-60" />
            <IconCmpSorting className="transition-opacity cursor-pointer hover:opacity-60" />
          </div>
        }
      />
      <div className="w-full px-5 overflow-x-auto">
        <VaultsTransactionsTable transactions={filteredTransactions} />
        {!filteredTransactions.length && !isFetching && (
          <EmptyCard
            className="h-64"
            icon={<IconCmpTransactions />}
            description="No recent transactions to display."
          />
        )}
      </div>
    </div>
  )
}

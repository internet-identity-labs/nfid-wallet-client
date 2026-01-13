import React, { useCallback, useMemo, useState } from "react"

import { Transaction } from "@nfid/integration"
import { EmptyCard, IconCmpTransactions } from "@nfid/ui"
import { bigIntMillisecondsToSeconds, isDateBetween } from "@nfid/utils"

import { VaultActionBar } from "../../action-bar"
import { useVault } from "../../hooks/use-vault"
import { useVaultTransactions } from "../../hooks/use-vault-transactions"

import { VaultsTransactionsTable } from "./table"

interface VaultsTransactionsPageProps {}

const initialTimeFilter = {
  from: "",
  to: "",
}

export const VaultsTransactionsPage: React.FC<
  VaultsTransactionsPageProps
> = () => {
  const [searchFilter, setSearchFilter] = useState("")
  const [initiatedFilter] = useState<string[]>([])
  const [statusFilter] = useState<string[]>([])
  const [timeFilter] = useState(initialTimeFilter)
  const { transactions, isFetching } = useVaultTransactions()
  const { vault } = useVault()

  const filteredTransactions: Transaction[] = useMemo(() => {
    if (!transactions) return []

    return transactions
      .map((transaction) => ({
        ...transaction,
        owner:
          vault?.members.find((member) => member.userId === transaction.owner)
            ?.name ?? transaction.owner,
      }))
      .filter((transaction) => transaction?.owner.includes(searchFilter))
      .filter((transaction) =>
        statusFilter.length ? statusFilter.includes(transaction.state) : true,
      )
      .filter((transaction) =>
        initiatedFilter.length
          ? initiatedFilter.includes(transaction.owner)
          : true,
      )
      .filter((transaction) => {
        if (!timeFilter.from.length && !timeFilter.to.length) return transaction

        return isDateBetween(
          new Date(bigIntMillisecondsToSeconds(transaction.createdDate)),
          timeFilter.from.length ? new Date(timeFilter.from) : undefined,
          timeFilter.to.length ? new Date(timeFilter.to) : undefined,
        )
      })
  }, [
    transactions,
    vault?.members,
    searchFilter,
    statusFilter,
    initiatedFilter,
    timeFilter.from,
    timeFilter.to,
  ])

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(e.target.value)
    },
    [],
  )

  return (
    <div className="border border-gray-200 rounded-xl mt-[30px]">
      <VaultActionBar onInputChange={onFilterChange} />
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

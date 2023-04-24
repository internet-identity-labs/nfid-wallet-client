import React, { useCallback, useMemo, useState } from "react"

import {
  EmptyCard,
  IconCmpSorting,
  IconCmpTransactions,
  IOption,
} from "@nfid-frontend/ui"
import {
  bigIntMillisecondsToSeconds,
  isDateBetween,
} from "@nfid-frontend/utils"
import { Transaction, TransactionState } from "@nfid/integration"

import { VaultActionBar } from "../../action-bar"
import { useVault } from "../../hooks/use-vault"
import { useVaultTransactions } from "../../hooks/use-vault-transactions"
import { VaultFilterTransactions } from "./modal-filters"
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
  const [initiatedFilter, setInitiatedFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [timeFilter, setTimeFilter] = useState(initialTimeFilter)
  const { transactions, isFetching } = useVaultTransactions()
  const { vault } = useVault()

  const initiatorsOptions = useMemo(() => {
    return (
      vault?.members.map(
        (member) =>
          ({
            label: member.name ?? "Unknown user",
            value: member.userId,
          } as IOption),
      ) ?? []
    )
  }, [vault?.members])

  const statusOptions = useMemo(() => {
    return Object.values(TransactionState).map(
      (status) =>
        ({
          label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          value: status,
        } as IOption),
    )
  }, [])

  const onResetFilters = useCallback(() => {
    setStatusFilter([])
    setInitiatedFilter([])
    setTimeFilter(initialTimeFilter)
  }, [])

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
      <VaultActionBar
        onInputChange={onFilterChange}
        actionButtons={
          <div className="flex items-center justify-end w-full ml-4 space-x-5">
            <VaultFilterTransactions
              initiatorsOptions={initiatorsOptions}
              statusOptions={statusOptions}
              initiatedFilter={initiatedFilter}
              setInitiatedFilter={(e) => setInitiatedFilter(e)}
              statusFilter={statusFilter}
              setStatusFilter={(e) => setStatusFilter(e)}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              onResetFilters={onResetFilters}
            />
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

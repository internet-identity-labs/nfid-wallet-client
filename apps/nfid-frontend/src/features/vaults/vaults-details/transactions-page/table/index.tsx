import React, { useCallback, useMemo, useState } from "react"

import { Table } from "@nfid-frontend/ui"
import { Transaction } from "@nfid/integration"

import { VaultsTransactionsTableHeader } from "./table-header"
import {
  VaultsTransactionsTableRow,
  VaultsTransactionsTableRowProps,
} from "./table-row"

export interface VaultsTransactionsTableProps {
  transactions: Transaction[]
}

export const VaultsTransactionsTable: React.FC<
  VaultsTransactionsTableProps
> = ({ transactions }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>()

  const transactionsToRows = useMemo(() => {
    return transactions.map(
      (transaction, index) =>
        ({
          number: index + 1,
          from: transaction.from_sub_account,
          to: transaction.to,
          initiatorName: transaction.owner,
          id: transaction.id,
          status: transaction.state,
          amount: transaction.amount,
          currency: transaction.currency,
        } as VaultsTransactionsTableRowProps),
    )
  }, [transactions])

  const onModalOpen = useCallback(
    (transactionsId: string) => {
      const transaction = transactions.find(
        (transactions) => transactions.id === BigInt(transactionsId),
      )
      setSelectedTransaction(transaction)
    },
    [transactions],
  )

  return (
    <Table tableHeader={<VaultsTransactionsTableHeader />}>
      {transactionsToRows.map((transaction) => (
        <VaultsTransactionsTableRow
          {...transaction}
          key={`transaction_${transaction.id}`}
        />
      ))}
    </Table>
  )
}

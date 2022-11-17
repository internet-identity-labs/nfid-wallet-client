import { format } from "date-fns"

import { Transaction, TransactionHistory } from "./rosetta_interface"

interface SelectTransactionProps {
  transactions: TransactionHistory
  accounts: string[]
}

export interface TransactionRow {
  type: "send" | "received"
  asset: string
  quantity: number
  date: string
  from: string
  to: string
}

const toTransactionRow =
  (type: "send" | "received") =>
  ({ transaction }: Transaction): TransactionRow => {
    return {
      type,
      asset: transaction.operations[0].amount.currency.symbol,
      quantity: Math.abs(Number(transaction.operations[0].amount.value)),
      date: format(
        new Date(transaction.metadata.timestamp / 1000000),
        "MMM dd, yyyy - hh:mm:ss aaa",
      ),
      from: transaction.operations[0].account.address,
      to: transaction.operations[1].account.address,
    }
  }

export const selectSendTransactions = ({
  transactions,
  accounts,
}: SelectTransactionProps): TransactionRow[] => {
  const transactionRows = transactions.transactions.map(
    toTransactionRow("send"),
  )
  return transactionRows.filter(
    (transactionRow) => accounts.indexOf(transactionRow.from) > -1,
  )
}

export const selectReceivedTransactions = ({
  transactions,
  accounts,
}: SelectTransactionProps): TransactionRow[] => {
  const transactionRows = transactions.transactions.map(
    toTransactionRow("received"),
  )
  return transactionRows.filter(
    (transactionRow) => accounts.indexOf(transactionRow.to) > -1,
  )
}

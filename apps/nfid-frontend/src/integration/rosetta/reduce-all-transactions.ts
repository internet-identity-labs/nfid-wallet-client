import { TransactionHistory } from "./rosetta_interface"

export const reduceAllTransactions = (transactions: TransactionHistory[]) => {
  return transactions.reduce<TransactionHistory>(
    (acc, current) => {
      const accumulatedBlockIdentifier = acc.transactions.map(
        (tx) => tx.blockIdentifier.hash,
      )
      const newBlockIdentifiers = current.transactions
        .filter(
          (tx) =>
            accumulatedBlockIdentifier.indexOf(tx.blockIdentifier.hash) === -1,
        )
        .map((tx) => tx.blockIdentifier.hash)

      if (!newBlockIdentifiers.length) return acc

      const filteredTransactions = current.transactions.filter(
        (tx) => newBlockIdentifiers.indexOf(tx.blockIdentifier.hash) !== -1,
      )
      return {
        totalCount: acc.totalCount + filteredTransactions.length,
        transactions: [...acc.transactions, ...filteredTransactions],
      }
    },
    { totalCount: 0, transactions: [] } as TransactionHistory,
  )
}

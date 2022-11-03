import {
  Balance,
  RosettaBalance,
  TransactionHistory,
  XdrUsd,
} from "./rosetta_interface"
import { camelizeKeys } from "./util"

export async function mapToXdrUsd(response: Response): Promise<XdrUsd> {
  return response.json().then((data) => data as XdrUsd)
}

export async function mapToTransactionHistory(
  response: Response,
): Promise<TransactionHistory> {
  return await response
    .json()
    .then((data) => camelizeKeys(data) as TransactionHistory)
    .then((data) => {
      // PASHUNYA REFACTOR. LOOKS WEIRD
      return {
        totalCount: data.totalCount,
        transactions: data.transactions.map((transaction) => ({
          blockIdentifier: transaction.blockIdentifier,
          transaction: {
            metadata: transaction.transaction.metadata,
            transactionIdentifier:
              transaction.transaction.transactionIdentifier,
            operations: transaction.transaction.operations.map((operation) => ({
              ...operation,
              amount: {
                currency: operation.amount.currency,
                value: (Number(operation.amount.value) / 10 ** 8).toString(),
              },
            })),
          },
        })),
      } as TransactionHistory
    })
}

export async function mapToBalance(response: Response): Promise<Balance> {
  return await response
    .json()
    .then((data) => data as RosettaBalance)
    .then((balance: RosettaBalance) => {
      return {
        ...balance.balances[0],
        value: (Number(balance.balances[0].value) / 10 ** 8).toString(),
      }
    })
}

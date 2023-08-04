import { FungibleActivityRecord } from "packages/integration/src/lib/asset/types"

import { Transaction } from "frontend/integration/rosetta/rosetta_interface"

import { IActivity } from "../connector/activity-connector-types"
import { IActivityAction } from "../types"

export const ethRecordsToActivities = (
  records: FungibleActivityRecord[],
): IActivity[] => {
  return records.map((record) => ({
    id: record.id,
    date: Number(record.date),
    from: record.from,
    to: record.to,
    transactionHash: record.transactionHash,
    action: IActivityAction.SEND,
    asset: {
      amount: record.price,
      amountUSD: record.price,
      currency: "ETH",
      type: "ft",
    },
  }))
}

export const icTransactionToActivity = (txs: Transaction[]): IActivity[] => {
  return txs.map((tx) => {
    return {
      id: tx.transaction.transactionIdentifier.hash,
      date: Math.floor(tx.transaction.metadata.timestamp / 1000000),
      from: tx.transaction.operations[0].account.address,
      to: tx.transaction.operations[1].account.address,
      transactionHash: tx.transaction.transactionIdentifier.hash,
      // Assuming the action is 'SEND' for all transactions
      action: IActivityAction.SEND,
      asset: {
        // Assuming the 'amount' and 'amountUSD' are both the same
        type: "ft",
        currency: "ICP", // Assuming the currency is 'USD' for all transactions
        amount: Math.abs(Number(tx.transaction.operations[0].amount.value)), // Assuming the first operation's amount is the value for the transaction
        amountUSD: Math.abs(Number(tx.transaction.operations[0].amount.value)), // Assuming the first operation's amount is the value for the transaction
      },
    }
  })
}

import { Activity } from "packages/integration/src/lib/asset/types"

import { Transaction } from "frontend/integration/rosetta/rosetta_interface"

import { IActivityAction } from "../types"

export const icFungibleTxsToActivity = (txs: Transaction[]): Activity[] => {
  return txs.map((tx) => {
    return {
      id: tx.transaction.transactionIdentifier.hash,
      date: new Date(Math.floor(tx.transaction.metadata.timestamp / 1000000)),
      from: tx.transaction.operations[0].account.address,
      to: tx.transaction.operations[1].account.address,
      transactionHash: tx.transaction.transactionIdentifier.hash,
      // Assuming the action is 'SEND' for all transactions
      action: IActivityAction.SENT,
      asset: {
        // Assuming the 'amount' and 'amountUSD' are both the same
        type: "ft",
        currency: "ICP", // Assuming the currency is 'USD' for all transactions
        amount: Math.abs(Number(tx.transaction.operations[0].amount.value)), // Assuming the first operation's amount is the value for the transaction
        amountUSD: `${Math.abs(
          Number(tx.transaction.operations[0].amount.value),
        )}`, // Assuming the first operation's amount is the value for the transaction
      },
    }
  })
}

import { Activity } from "packages/integration/src/lib/asset/types"

import { Transaction } from "frontend/integration/rosetta/rosetta_interface"

import { IActivityAction } from "../types"

export const mapToActivity = (
  tx: Transaction,
  type: IActivityAction,
): Activity => {
  return {
    id: tx.transaction.transactionIdentifier.hash,
    date: new Date(Math.floor(tx.transaction.metadata.timestamp / 1000000)),
    from: tx.transaction.operations[0].account.address,
    to: tx.transaction.operations[1].account.address,
    transactionHash: tx.transaction.transactionIdentifier.hash,
    action: type,
    asset: {
      type: "ft",
      currency: "ICP",
      amount: Math.abs(Number(tx.transaction.operations[0].amount.value)),
      amountUSD: `${Math.abs(
        Number(tx.transaction.operations[0].amount.value),
      )}`,
    },
  }
}

export const icFungibleTxsToActivity = (
  txs: Transaction[],
  accounts: string[],
): Activity[] => {
  const mappedTxs = txs.map((tx) => {
    if (
      accounts.includes(tx.transaction.operations[0].account.address) &&
      accounts.includes(tx.transaction.operations[1].account.address)
    )
      return [
        mapToActivity(tx, IActivityAction.RECEIVED),
        mapToActivity(tx, IActivityAction.SENT),
      ]

    return [
      mapToActivity(
        tx,
        accounts.includes(tx.transaction.operations[1].account.address)
          ? IActivityAction.RECEIVED
          : IActivityAction.SENT,
      ),
    ]
  })

  return mappedTxs.flat()
}

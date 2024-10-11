import { Activity } from "packages/integration/src/lib/asset/types"
import { getUserIdData } from "packages/integration/src/lib/cache/cache"

import { ICRC1TypeOracle } from "@nfid/integration"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import {
  IActivityAction,
  ICRC1IndexData,
  TransactionData,
} from "@nfid/integration/token/icrc1/types"

import { swapTransactionService } from "frontend/integration/icpswap/service/transaction-service"
import { SwapTransaction } from "frontend/integration/icpswap/swap-transaction"

import { IActivityRow } from "../types"

const filterTransaction = (
  filteredContracts: string[] = [],
  allCanistersActivities: ICRC1IndexData[],
): TransactionData[] => {
  let transactions: TransactionData[]
  if (!filteredContracts.length) {
    transactions = allCanistersActivities.flatMap(
      (activity) => activity.transactions,
    )
  } else {
    transactions = allCanistersActivities.flatMap((activity) =>
      activity.transactions.filter(
        (transaction) =>
          filteredContracts.includes(transaction.canister!) ||
          filteredContracts.includes(transaction.canisterTo!),
      ),
    )
  }

  return transactions
}

const getActivities = async (
  filteredContracts: string[],
): Promise<Activity[]> => {
  const { publicKey } = await getUserIdData()
  const transactions = await swapTransactionService.getTransactions(publicKey)
  const icrc1Canisters = await icrc1OracleService.getICRC1Canisters()

  const txsFormatted = [
    {
      oldestTransactionId: undefined,
      transactions: await Promise.all(
        transactions.map(async (tx: SwapTransaction) => {
          const st: ICRC1TypeOracle[] = icrc1Canisters.filter(
            (icrc1) =>
              icrc1.ledger === tx.getSourceLedger() ||
              icrc1.ledger === tx.getTargetLedger(),
          )

          const token = st.find(
            (icrc1) => icrc1.ledger === tx.getSourceLedger(),
          )
          const tokenTo = st.find(
            (icrc1) => icrc1.ledger === tx.getTargetLedger(),
          )

          return {
            type: IActivityAction.SWAP,
            timestamp: BigInt(tx.getStartTime()) || BigInt(0),
            transactionId: tx.getTransferId() || BigInt(0),
            symbol: token!.symbol,
            symbolTo: tokenTo!.symbol,
            icon: token!.logo[0],
            iconTo: tokenTo!.logo[0],
            decimals: token!.decimals,
            decimalsTo: tokenTo!.decimals,
            amount: tx.getSourceAmount(),
            amountTo: tx.getWithdraw() || BigInt(0),
            canister: tx.getSourceLedger(),
            canisterTo: tx.getTargetLedger(),
            from: "",
            to: "",
            error: tx.getError(),
          }
        }),
      ),
    },
  ]

  return filterTransaction(filteredContracts, txsFormatted).map(
    (tx: TransactionData) =>
      ({
        id: tx.transactionId.toString(),
        date: new Date(Number(tx.timestamp)),
        from: tx.from,
        to: tx.to,
        transactionHash: tx.transactionId.toString(),
        action: tx.type,
        asset: {
          type: "ft",
          currency: tx.symbol,
          currencyTo: tx.symbolTo,
          icon: tx.icon,
          iconTo: tx.iconTo,
          decimals: tx.decimals,
          decimalsTo: tx.decimalsTo,
          amount: Number(tx.amount),
          amountTo: Number(tx.amountTo),
          canister: tx.canister,
          canisterTo: tx.canisterTo,
          rate: undefined,
          error: tx.error,
        },
      } as Activity),
  )
}

const mapActivitiesToRows = (activities: Activity[]): IActivityRow[] => {
  return activities.map((activity) => ({
    id: activity.id,
    action: activity.action,
    asset: activity.asset,
    type: activity.asset.type,
    timestamp: activity.date,
    from: activity.from,
    to: activity.to,
  }))
}

export const getSwapActivitiesRows = async (
  filteredContracts: string[] = [],
): Promise<IActivityRow[]> => {
  const activities = await getActivities(filteredContracts)
  const activitiesRows = mapActivitiesToRows(activities)

  return activitiesRows
}

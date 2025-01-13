import { Activity } from "packages/integration/src/lib/asset/types"

import { ICRC1TypeOracle } from "@nfid/integration"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import {
  IActivityAction,
  ICRC1IndexData,
  TransactionData,
} from "@nfid/integration/token/icrc1/types"

import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

import { IActivityRow } from "../types"
import {IcpSwapTransactionImpl} from "src/integration/swap/icpswap/impl/icp-swap-transaction-impl";

interface TransactionDataExtended extends TransactionData {
  transaction: SwapTransaction
}

const filterTransaction = (
  filteredContracts: string[] = [],
  allCanistersActivities: ICRC1IndexData[],
): TransactionData[] => {
  return allCanistersActivities.flatMap((activity) =>
    filteredContracts.length === 0
      ? activity.transactions
      : activity.transactions.filter(
          (transaction) =>
            filteredContracts.includes(transaction.canister!) ||
            filteredContracts.includes(transaction.canisterTo!),
        ),
  )
}

const formatTransaction = async (
  tx: SwapTransaction,
  icrc1Canisters: ICRC1TypeOracle[],
): Promise<TransactionDataExtended> => {
  const token = icrc1Canisters.find(
    (icrc1) => icrc1.ledger === tx.getSourceLedger(),
  )
  const tokenTo = icrc1Canisters.find(
    (icrc1) => icrc1.ledger === tx.getTargetLedger(),
  )

  return  {
    type: IActivityAction.SWAP,
    timestamp: BigInt(tx.getStartTime()) || BigInt(0),
    transactionId: BigInt(0),
    symbol: token!.symbol,
    symbolTo: tokenTo!.symbol,
    icon: token!.logo[0],
    iconTo: tokenTo!.logo[0],
    decimals: token!.decimals,
    decimalsTo: tokenTo!.decimals,
    amount: tx.getSourceAmount(),
    amountTo: BigInt(tx.getQuote()) || BigInt(0),
    canister: tx.getSourceLedger(),
    canisterTo: tx.getTargetLedger(),
    from: "",
    to: "",
    transaction: tx,
  }
}

const getFormattedTransactions = async (): Promise<ICRC1IndexData[]> => {
  const transactions = await swapTransactionService.getTransactions()
  const icrc1Canisters = await icrc1OracleService.getICRC1Canisters()

  const formattedTransactions = await Promise.all(
    transactions.map((tx) => formatTransaction(tx, icrc1Canisters)),
  )

  return [
    {
      oldestTransactionId: undefined,
      transactions: formattedTransactions,
    },
  ]
}

const getActivities = async (
  filteredContracts: string[],
): Promise<Activity[]> => {
  const txsFormatted = await getFormattedTransactions()

  return filterTransaction(filteredContracts, txsFormatted).map(
    (xt: TransactionData) => {
      let tx = xt as TransactionDataExtended

      return {
        id: tx.transactionId.toString(),
        date: new Date(Number(tx.timestamp)),
        from: tx.from,
        to: tx.to,
        transactionHash: tx.transactionId.toString(),
        action: tx.type,
        transaction: tx.transaction,
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
        },
      } as Activity
    },
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
    transaction: activity.transaction,
  }))
}

export const getSwapActivitiesRows = async (
  filteredContracts: string[] = [],
): Promise<IActivityRow[]> => {
  const activities = await getActivities(filteredContracts)
  return mapActivitiesToRows(activities)
}

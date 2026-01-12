import {
  Activity,
  ActivityAssetFT,
} from "packages/integration/src/lib/asset/types"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"

import { ICRC1TypeOracle } from "@nfid/integration"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import {
  IActivityAction,
  ICRC1IndexData,
  TransactionData,
} from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "../types"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { FT } from "frontend/integration/ft/ft"
import { getExplorerLink } from "./icrc1-activity"

interface TransactionDataExtended extends TransactionData {
  transaction: SwapTransaction
}

const getAllTransactions = (
  allCanistersActivities: ICRC1IndexData[],
): TransactionData[] =>
  allCanistersActivities.flatMap((activity) => activity.transactions)

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

  return {
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

const getActivities = async (activeTokens: FT[]): Promise<Activity[]> => {
  const txsFormatted = await getFormattedTransactions()

  return getAllTransactions(txsFormatted).map((xt: TransactionData) => {
    const tx = xt as TransactionDataExtended
    const token = activeTokens.find((t) => t.getTokenAddress() === tx.canister)

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
        chainId: ChainId.ICP,
        category: token?.getTokenCategory(),
        rootCanister: token?.getRootSnsCanister(),
      },
    } as Activity
  })
}

const mapActivitiesToRows = (activities: Activity[]): IActivityRow[] =>
  activities.map((activity) => ({
    id: activity.id,
    action: activity.action,
    asset: activity.asset,
    type: activity.asset.type,
    timestamp: activity.date,
    from: activity.from,
    to: activity.to,
    transaction: activity.transaction,
    scanLink: getExplorerLink(
      activity.transaction.transferId,
      activity.asset as ActivityAssetFT,
    ),
  }))

export const getSwapActivitiesRows = async (
  activeTokens: FT[],
): Promise<IActivityRow[]> => {
  const activities = await getActivities(activeTokens)
  return mapActivitiesToRows(activities)
}

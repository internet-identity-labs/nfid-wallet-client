import { Activity } from "packages/integration/src/lib/asset/types"
import { getUserIdData } from "packages/integration/src/lib/cache/cache"
import { fetchAllTokenByAddress } from "packages/ui/src/organisms/tokens/utils"

import {
  IActivityAction,
  ICRC1IndexData,
  TransactionData,
} from "@nfid/integration/token/icrc1/types"
import { Blockchain, TokenStandards } from "@nfid/integration/token/types"

import { swapTransactionService } from "frontend/integration/icpswap/service/transaction-service"
import { SwapTransaction } from "frontend/integration/icpswap/swap-transaction"

import { getTxType } from "../../util/tx-type"
import { ActivityClass } from "../activity"
import { IActivityConfig } from "../activity-connector-types"

export class SwapActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(filteredContracts: string[]): Promise<Activity[]> {
    const { publicKey } = await getUserIdData()

    const txs = await swapTransactionService.getTransactions(publicKey)

    console.log(txs)

    const txsFormatted = [
      {
        oldestTransactionId: undefined,
        transactions: await Promise.all(
          txs.map(async (tx: SwapTransaction) => {
            const token = await fetchAllTokenByAddress(tx.getSourceLedger())
            const tokenTo = await fetchAllTokenByAddress(tx.getTargetLedger())
            const endTime = tx.getEndTime()
            return {
              type: IActivityAction.SWAP,
              timestamp: endTime !== undefined ? BigInt(endTime) : BigInt(0),
              transactionId: tx.getTransferId() || BigInt(0),
              symbol: token.getTokenSymbol(),
              symbolTo: tokenTo.getTokenSymbol(),
              icon: token.getTokenLogo()!,
              iconTo: tokenTo.getTokenLogo()!,
              decimals: token.getTokenDecimals()!,
              decimalsTo: tokenTo.getTokenDecimals()!,
              amount: tx.getSourceAmount(),
              amountTo: tx.getWithdraw() || BigInt(0),
              canister: tx.getSourceLedger(),
              canisterTo: tx.getTargetLedger(),
              from: "",
              to: "",
            }
          }),
        ),
      },
    ]

    return this.filterTransaction(filteredContracts, txsFormatted).map(
      (tx: TransactionData) =>
        ({
          id: tx.transactionId.toString(),
          date: new Date(Number(tx.timestamp)),
          from: tx.from,
          to: tx.to,
          transactionHash: tx.transactionId.toString(),
          action: getTxType(tx.type),
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
        } as Activity),
    )
  }

  private filterTransaction(
    filteredContracts: string[] = [],
    allCanistersActivities: ICRC1IndexData[],
  ): TransactionData[] {
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
}

export const swapActivityConnector = new SwapActivityConnector({
  network: Blockchain.IC,
  tokenStandard: TokenStandards.ICP,
})

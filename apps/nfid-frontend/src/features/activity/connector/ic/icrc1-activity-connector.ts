import { Activity } from "packages/integration/src/lib/asset/types"
import { getUserPrincipalId } from "packages/ui/src/organisms/tokens/utils"

import { getICRC1HistoryDataForUser } from "@nfid/integration/token/icrc1"
import {
  ICRC1IndexData,
  TransactionData,
} from "@nfid/integration/token/icrc1/types"
import { Blockchain, TokenStandards } from "@nfid/integration/token/types"

import { nanoSecondsToDate } from "../../util/activity"
import { ActivityClass } from "../activity"
import { IActivityConfig } from "../activity-connector-types"

export class ICRC1ActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(filteredContracts: string[]): Promise<Activity[]> {
    const { userPrincipal, publicKey } = await getUserPrincipalId()
    const allCanistersActivities = await getICRC1HistoryDataForUser(
      userPrincipal!,
      publicKey,
      BigInt(10),
    )

    return this.filterTransaction(
      filteredContracts,
      allCanistersActivities,
    ).map(
      (tx: TransactionData) =>
        ({
          id: tx.transactionId.toString(),
          date: new Date(nanoSecondsToDate(tx.timestamp)),
          from: tx.from,
          to: tx.to,
          transactionHash: tx.transactionId.toString(),
          action: tx.type,
          asset: {
            type: "ft",
            currency: tx.symbol,
            decimals: tx.decimals,
            amount: Number(tx.amount),
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
      transactions = allCanistersActivities
        .filter((activity) => filteredContracts.includes(activity.canisterId!))
        .flatMap((activity) => activity.transactions)
    }

    return transactions
  }
}

export const icrc1ActivityConnector = new ICRC1ActivityConnector({
  network: Blockchain.IC,
  tokenStandard: TokenStandards.ICP,
})

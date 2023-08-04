import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { TokenStandards } from "@nfid/integration/token/types"

import { getAllTransactionHistory } from "frontend/integration/rosetta/transactions/get-all-transaction-history"
import { Blockchain } from "frontend/ui/connnector/types"

import { icTransactionToActivity } from "../../util/activity"
import { ActivityClass } from "../activity"
import { IActivity, IActivityConfig } from "../activity-connector-types"

export class ICActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(): Promise<IActivity[]> {
    const allPrincipals = await this.getAllPrincipals(false)
    const { transactions } = await getAllTransactionHistory(
      allPrincipals.map((p) => p.principal),
    )

    return icTransactionToActivity(transactions)
  }
}

export const icActivityConnector = new ICActivityConnector({
  chain: Chain.IC,
  network: Blockchain.IC,
  tokenStandard: TokenStandards.ICP,
})

import { principalToAddress } from "ictool"
import { Activity } from "packages/integration/src/lib/asset/types"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { TokenStandards } from "@nfid/integration/token/types"

import { getAllTransactionHistory } from "frontend/integration/rosetta/transactions/get-all-transaction-history"
import { Blockchain } from "frontend/ui/connnector/types"

import { icFungibleTxsToActivity } from "../../util/activity"
import { ActivityClass } from "../activity"
import { IActivityConfig } from "../activity-connector-types"

export class ICActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(): Promise<Activity[]> {
    const allPrincipals = await this.getAllPrincipals(false)
    const allAccounts = allPrincipals.map((p) =>
      principalToAddress(p.principal),
    )

    const icpTransactions = await getAllTransactionHistory(
      allPrincipals.map((p) => p.principal),
    )

    return icFungibleTxsToActivity(icpTransactions.transactions, allAccounts)
  }
}

export const icActivityConnector = new ICActivityConnector({
  chain: Chain.IC,
  network: Blockchain.IC,
  tokenStandard: TokenStandards.ICP,
})

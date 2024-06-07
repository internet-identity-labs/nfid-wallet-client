import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Activity } from "packages/integration/src/lib/asset/types"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { TokenStandards } from "@nfid/integration/token/types"

import { getICPTransactionHistory } from "frontend/integration/rosetta/transactions/get-all-transaction-history"
import { Blockchain } from "frontend/ui/connnector/types"

import { icFungibleTxsToActivity } from "../../util/activity"
import { ActivityClass } from "../activity"
import { IActivityConfig } from "../activity-connector-types"

export class ICActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(filteredCanisters: string[] = []): Promise<Activity[]> {
    if (
      filteredCanisters.length &&
      !filteredCanisters.includes(ICP_CANISTER_ID)
    )
      return []

    const allPrincipals = await this.getAllPrincipals(false)
    const allAccounts = allPrincipals.map((p) =>
      AccountIdentifier.fromPrincipal({ principal: p.principal }).toHex(),
    )

    const icpTransactions = await getICPTransactionHistory(
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

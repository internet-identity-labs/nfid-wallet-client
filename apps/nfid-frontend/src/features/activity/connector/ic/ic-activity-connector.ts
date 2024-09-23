import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Activity } from "packages/integration/src/lib/asset/types"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { Blockchain, TokenStandards } from "@nfid/integration/token/types"

import { getICPTransactionHistory } from "frontend/integration/rosetta/transactions/get-all-transaction-history"

import { icFungibleTxsToActivity } from "../../util/activity"
import { ActivityClass } from "../activity"
import { IActivityConfig } from "../activity-connector-types"

export class ICActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(filteredContracts: string[] = []): Promise<Activity[]> {
    if (
      filteredContracts.length &&
      !filteredContracts.includes(ICP_CANISTER_ID)
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
  network: Blockchain.IC,
  tokenStandard: TokenStandards.ICP,
})

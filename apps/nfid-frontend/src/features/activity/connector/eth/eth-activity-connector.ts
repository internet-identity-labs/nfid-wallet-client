import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { ethereumGoerliAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import { IActivityRow } from "../../types"
import { ethRecordsToActivities } from "../../util/activity"
import { ActivityClass } from "../activity"
import { IActivity, IActivityConfig, IActivityDetails } from "../types"

export class EthActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(): Promise<IActivity[]> {
    const identity = this.getIdentity()

    const { receivedTransactions, sendTransactions } =
      await ethereumGoerliAsset.getTransactionHistory(identity)

    return ethRecordsToActivities(
      receivedTransactions.activities.concat(sendTransactions.activities),
    )
  }

  getActivityDetails(row: IActivityRow): Promise<IActivityDetails> {
    throw new Error("Method not implemented.")
  }
}

export const ethActivityConnector = new EthActivityConnector({
  chain: Chain.ETH,
  network: Blockchain.ETHEREUM,
  tokenStandard: TokenStandards.ETH,
})

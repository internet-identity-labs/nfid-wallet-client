import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import { ethRecordsToActivities } from "../../../util/activity"
import { ActivityClass } from "../../activity"
import { IActivityConfig, IActivity } from "../../activity-connector-types"

export class EthActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(): Promise<IActivity[]> {
    const identity = this.getIdentity()

    const { receivedTransactions, sendTransactions } =
      await ethereumAsset.getTransactionHistory(identity)

    return ethRecordsToActivities(
      receivedTransactions.activities.concat(sendTransactions.activities),
    )
  }
}

export const ethActivityConnector = new EthActivityConnector({
  chain: Chain.ETH,
  network: Blockchain.ETHEREUM,
  tokenStandard: TokenStandards.ETH,
})

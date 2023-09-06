import { Activity } from "packages/integration/src/lib/asset/types"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import { ActivityClass } from "../../activity"
import { IActivityConfig } from "../../activity-connector-types"

export class EthActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(): Promise<Activity[]> {
    const identity = await this.getIdentity()
    return await ethereumAsset.getActivityByUser(identity)
  }
}

export const ethActivityConnector = new EthActivityConnector({
  chain: Chain.ETH,
  network: Blockchain.ETHEREUM,
  tokenStandard: TokenStandards.ETH,
})

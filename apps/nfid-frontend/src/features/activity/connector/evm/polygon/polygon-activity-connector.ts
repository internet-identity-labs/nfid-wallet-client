import { Activity } from "packages/integration/src/lib/asset/types"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import { ActivityClass } from "../../activity"
import { IActivityConfig } from "../../activity-connector-types"

export class PolygonActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(): Promise<Activity[]> {
    const identity = await this.getIdentity()
    return await polygonAsset.getActivityByUser(identity)
  }
}

export const polygonActivityConnector = new PolygonActivityConnector({
  chain: Chain.ETH,
  network: Blockchain.POLYGON,
  tokenStandard: TokenStandards.MATIC,
})

import { Activity } from "packages/integration/src/lib/asset/types"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { polygonMumbaiAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import { ActivityClass } from "../../activity"
import { IActivityConfig } from "../../activity-connector-types"

export class PolygonMumbaiActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(): Promise<Activity[]> {
    const identity = await this.getIdentity()
    return await polygonMumbaiAsset.getActivityByUser(identity)
  }
}

export const polygonMumbaiActivityConnector =
  new PolygonMumbaiActivityConnector({
    chain: Chain.ETH,
    network: Blockchain.POLYGON_MUMBAI,
    tokenStandard: TokenStandards.MATIC,
  })

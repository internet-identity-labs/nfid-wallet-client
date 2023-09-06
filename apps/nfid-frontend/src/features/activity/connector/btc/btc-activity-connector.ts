import { Activity } from "packages/integration/src/lib/asset/types"
import { BtcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import { ActivityClass } from "../activity"
import { IActivityConfig } from "../activity-connector-types"

export class BTCActivityConnector extends ActivityClass<IActivityConfig> {
  async getActivities(): Promise<Activity[]> {
    const identity = await this.getIdentity()
    return await new BtcAsset().getActivityByUser(identity)
  }
}

export const btcActivityConnector = new BTCActivityConnector({
  chain: Chain.BTC,
  network: Blockchain.BITCOIN,
  tokenStandard: TokenStandards.BTC,
})

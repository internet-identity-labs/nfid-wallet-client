import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class MaticAssetDetailsConnector extends FungibleAssetDetailsConnector {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return polygonAsset
      .getNativeAccount(principal, this.config.icon)
      .then((l) => [l])
  }
}

export const maticAssetDetailsConnector = new MaticAssetDetailsConnector({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.MATIC,
})

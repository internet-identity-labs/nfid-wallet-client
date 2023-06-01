import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"

import { PolygonERC20Svg } from "@nfid-frontend/ui"
import { polygonMumbaiAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class PolygonERC20AssetDetailsConnector extends FungibleAssetDetailsConnector {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return polygonMumbaiAsset.getAccounts(principal, this.config.icon)
  }
}

export const polygonERC20AssetDetailsConnector =
  new PolygonERC20AssetDetailsConnector({
    tokenStandard: TokenStandards.ERC20_POLYGON,
    icon: PolygonERC20Svg,
  })

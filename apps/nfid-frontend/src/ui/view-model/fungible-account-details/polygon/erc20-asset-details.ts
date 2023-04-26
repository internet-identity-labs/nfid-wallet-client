import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsView } from "src/ui/view-model/fungible-account-details/fungible-asset-detail"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class PolygonERC20AssetDetailsView extends FungibleAssetDetailsView {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return polygonAsset.getAccounts(principal, this.config.icon)
  }
}

export const polygonERC20AssetDetailsView = new PolygonERC20AssetDetailsView({
  tokenStandard: TokenStandards.ERC20_POLYGON,
  icon: IconPngEthereum,
})

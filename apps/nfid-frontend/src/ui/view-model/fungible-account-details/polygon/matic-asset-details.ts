import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsView } from "src/ui/view-model/fungible-account-details/fungible-asset-detail"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class MaticAssetDetailsView extends FungibleAssetDetailsView {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return polygonAsset
      .getNativeAccount(principal, this.config.icon)
      .then((l) => [l])
  }
}

export const maticAssetDetailsView = new MaticAssetDetailsView({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.MATIC,
})

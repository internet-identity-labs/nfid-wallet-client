import { FungibleAssetView } from "src/ui/view-model/fungible-asset-screen/fungible-asset"
import { erc20ToTokenConfig } from "src/ui/view-model/fungible-asset-screen/util/util"
import { Blockchain, NativeToken, TokenConfig } from "src/ui/view-model/types"

import { IconERC20 } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class PolygonERC20AssetView extends FungibleAssetView {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return polygonAsset.getAccounts(principal, this.config.icon).then((ts) => {
      return ts.map((l) => {
        return erc20ToTokenConfig(this.config, l)
      })
    })
  }
}

export const polygonERC20AssetView = new PolygonERC20AssetView({
  tokenStandard: TokenStandards.ERC20P,
  icon: IconERC20,
  blockchain: Blockchain.POLYGON,
  feeCurrency: NativeToken.MATIC,
})

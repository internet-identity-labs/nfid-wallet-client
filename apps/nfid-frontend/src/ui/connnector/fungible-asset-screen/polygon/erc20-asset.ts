import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { erc20ToTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetErc20Config,
  Blockchain,
  NativeToken,
  TokenConfig,
} from "src/ui/connnector/types"

import { PolygonERC20Svg } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class PolygonERC20AssetConnector extends FungibleAssetConnector<AssetErc20Config> {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return polygonAsset.getAccounts(principal, this.config.icon).then((ts) => {
      return ts.map((l) => {
        return erc20ToTokenConfig(this.config, l)
      })
    })
  }
}

export const polygonERC20AssetConnector = new PolygonERC20AssetConnector({
  tokenStandard: TokenStandards.ERC20_POLYGON,
  icon: PolygonERC20Svg,
  blockchain: Blockchain.POLYGON,
  feeCurrency: NativeToken.MATIC,
})

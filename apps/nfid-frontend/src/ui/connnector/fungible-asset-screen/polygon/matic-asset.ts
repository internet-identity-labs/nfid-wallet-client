import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { toNativeTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetNativeConfig,
  Blockchain,
  NativeToken,
  TokenConfig,
} from "src/ui/connnector/types"

import { MaticSvg } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class MaticAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return polygonAsset
      .getNativeAccount(principal, this.config.icon)
      .then((matic) => [toNativeTokenConfig(this.config, matic)])
  }
}

export const maticAssetConnector = new MaticAssetConnector({
  icon: MaticSvg,
  tokenStandard: TokenStandards.MATIC,
  title: "Matic",
  feeCurrency: NativeToken.MATIC,
  blockchain: Blockchain.POLYGON,
})

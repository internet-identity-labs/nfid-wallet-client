import { FungibleAssetConnector } from "src/ui/view-model/fungible-asset-screen/fungible-asset"
import { nativeToTokenConfig } from "src/ui/view-model/fungible-asset-screen/util/util"
import { Blockchain, NativeToken, TokenConfig } from "src/ui/view-model/types"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class MaticAssetConnector extends FungibleAssetConnector {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return polygonAsset
      .getNativeAccount(principal, this.config.icon)
      .then((matic) => [nativeToTokenConfig(this.config, matic)])
  }
}

export const maticAssetConnector = new MaticAssetConnector({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.MATIC,
  title: "Matic",
  currency: NativeToken.MATIC,
  blockchain: Blockchain.POLYGON.toString(),
})

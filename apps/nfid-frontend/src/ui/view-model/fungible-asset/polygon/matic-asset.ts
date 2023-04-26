import { FungibleAssetView } from "src/ui/view-model/fungible-asset/fungible-asset";
import { Blockchain, NativeToken, TokenConfig } from "src/ui/view-model/fungible-asset/types";
import { nativeToTokenConfig } from "src/ui/view-model/fungible-asset/util/util";

import { IconSvgBTC } from "@nfid-frontend/ui";
import { polygonAsset } from "@nfid/integration";
import { TokenStandards } from "@nfid/integration/token/types";

export class MaticAssetView extends FungibleAssetView {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return polygonAsset
      .getNativeAccount(principal, this.config.icon)
      .then((matic) => [nativeToTokenConfig(this.config, matic)])
  }
}

export const maticAssetView = new MaticAssetView({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.MATIC,
  title: "Matic",
  currency: NativeToken.MATIC,
  blockchain: Blockchain.POLYGON.toString(),
})

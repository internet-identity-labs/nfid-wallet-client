import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { toNativeTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetFilter,
  AssetNativeConfig,
  Blockchain,
  NativeToken,
  TokenConfig,
} from "src/ui/connnector/types"

import { MaticSvg } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class MaticAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getTokenConfigs(
    assetFilter?: AssetFilter[],
  ): Promise<Array<TokenConfig>> {
    console.log({ assetFilter })
    const identity = await this.getIdentity(
      assetFilter?.map((filter) => filter.principal),
    )
    if (!identity) return []

    return polygonAsset
      .getNativeAccount(identity, this.config.icon)
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

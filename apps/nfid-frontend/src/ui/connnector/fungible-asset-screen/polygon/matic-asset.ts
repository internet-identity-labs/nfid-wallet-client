import { DelegationIdentity } from "@dfinity/identity"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { toNativeTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetNativeConfig,
  Blockchain,
  NativeToken,
  PolygonNetwork,
  TokenConfig,
} from "src/ui/connnector/types"

import { MaticSvg } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class MaticAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getAccounts(
    identity: DelegationIdentity[],
  ): Promise<Array<TokenConfig>> {
    return polygonAsset
      .getNativeAccount(identity[0], this.config.icon)
      .then((matic) => [toNativeTokenConfig(this.config, matic)])
  }
}

export const maticAssetConnector = new MaticAssetConnector({
  icon: MaticSvg,
  tokenStandard: TokenStandards.MATIC,
  title: "Matic",
  feeCurrency: NativeToken.MATIC,
  blockchain: Blockchain.POLYGON,
  network: PolygonNetwork.MAINNET,
})

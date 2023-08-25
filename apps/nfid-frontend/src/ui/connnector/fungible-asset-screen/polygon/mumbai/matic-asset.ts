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
import { NetworkKey } from "@nfid/client-db"
import { polygonMumbaiAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class MaticMumbaiAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getAccounts(
    identity: DelegationIdentity[],
  ): Promise<Array<TokenConfig>> {
    return polygonMumbaiAsset
      .getNativeAccount(
        identity[0],
        this.config.icon,
        await this.getCachedAddress(NetworkKey.EVM),
      )
      .then(async (matic) => [
        toNativeTokenConfig(
          this.config,
          matic,
          NetworkKey.EVM,
          await this.getProfileAnchor(),
        ),
      ])
  }
}

export const maticMumbaiAssetConnector = new MaticMumbaiAssetConnector({
  icon: MaticSvg,
  tokenStandard: TokenStandards.MATIC,
  title: "Matic Mumbai",
  feeCurrency: NativeToken.MATIC,
  blockchain: Blockchain.POLYGON_MUMBAI,
  network: PolygonNetwork.MUMBAI,
})

import { DelegationIdentity } from "@dfinity/identity"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { erc20ToTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetErc20Config,
  Blockchain,
  NativeToken,
  PolygonNetwork,
  TokenConfig,
} from "src/ui/connnector/types"

import { PolygonERC20Svg } from "@nfid-frontend/ui"
import { NetworkKey } from "@nfid/client-db"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class PolygonERC20AssetConnector extends FungibleAssetConnector<AssetErc20Config> {
  async getAccounts(
    identity: DelegationIdentity[],
  ): Promise<Array<TokenConfig>> {
    return polygonAsset
      .getAccounts(
        identity[0],
        this.config.icon,
        await this.getCachedAddress(NetworkKey.EVM),
      )
      .then((ts) => {
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
  network: PolygonNetwork.MAINNET,
})

import { DelegationIdentity } from "@dfinity/identity"
import { btcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { toNativeTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetNativeConfig,
  Blockchain,
  BTCNetwork,
  NativeToken,
  TokenConfig,
} from "src/ui/connnector/types"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { NetworkKey } from "@nfid/client-db"
import { TokenStandards } from "@nfid/integration/token/types"

export class BtcAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getAccounts(
    identity: DelegationIdentity[],
  ): Promise<Array<TokenConfig>> {
    return btcAsset
      .getRootAccount(
        identity[0],
        IconSvgBTC,
        await this.getCachedAddress(NetworkKey.BTC),
      )
      .then(async (token) => {
        return [
          toNativeTokenConfig(
            this.config,
            token,
            NetworkKey.BTC,
            await this.getProfileAnchor(),
          ),
        ]
      })
  }
}

export const btcAssetConnector = new BtcAssetConnector({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.BTC,
  title: "Bitcoin",
  feeCurrency: NativeToken.BTC,
  blockchain: Blockchain.BITCOIN,
  network: BTCNetwork.MAINNET,
})

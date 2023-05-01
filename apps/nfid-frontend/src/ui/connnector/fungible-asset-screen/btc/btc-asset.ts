import { btcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { toNativeTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetNativeConfig,
  Blockchain,
  NativeToken,
  TokenConfig,
} from "src/ui/connnector/types"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

export class BtcAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return btcAsset.getRootAccount(principal, IconSvgBTC).then((token) => {
      return [toNativeTokenConfig(this.config, token)]
    })
  }
}

export const btcAssetConnector = new BtcAssetConnector({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.BTC,
  title: "Bitcoin",
  feeCurrency: NativeToken.BTC,
  blockchain: Blockchain.BITCOIN,
})

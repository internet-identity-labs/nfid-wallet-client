import { btcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { nativeToTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import { Blockchain, NativeToken, TokenConfig } from "src/ui/connnector/types"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

export class BtcAssetConnector extends FungibleAssetConnector {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return btcAsset.getRootAccount(principal, IconSvgBTC).then((token) => {
      return [nativeToTokenConfig(this.config, token)]
    })
  }
}

export const btcAssetConnector = new BtcAssetConnector({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.BTC,
  title: "Bitcoin",
  currency: NativeToken.BTC,
  blockchain: Blockchain.BITCOIN,
})

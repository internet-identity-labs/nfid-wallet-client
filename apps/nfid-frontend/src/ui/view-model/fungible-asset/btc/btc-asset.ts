import { btcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { FungibleAssetView } from "src/ui/view-model/fungible-asset/fungible-asset"
import {
  Blockchain,
  NativeToken,
  TokenConfig,
} from "src/ui/view-model/fungible-asset/types"
import { nativeToTokenConfig } from "src/ui/view-model/fungible-asset/util/util"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

export class BtcAssetView extends FungibleAssetView {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return btcAsset.getRootAccount(principal, IconSvgBTC).then((token) => {
      return [nativeToTokenConfig(this.config, token)]
    })
  }
}

export const btcAssetView = new BtcAssetView({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.BTC,
  title: "Bitcoin",
  currency: NativeToken.BTC,
  blockchain: Blockchain.BITCOIN,
})

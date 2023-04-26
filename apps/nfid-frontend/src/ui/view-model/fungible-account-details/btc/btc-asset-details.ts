import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { btcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { FungibleAssetDetailsView } from "src/ui/view-model/fungible-account-details/fungible-asset-detail"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

export class BtcAssetDetailsView extends FungibleAssetDetailsView {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return btcAsset
      .getRootAccount(principal, this.config.icon)
      .then((token) => {
        return [token]
      })
  }
}

export const btcAssetDetailsView = new BtcAssetDetailsView({
  tokenStandard: TokenStandards.BTC,
  icon: IconSvgBTC,
})

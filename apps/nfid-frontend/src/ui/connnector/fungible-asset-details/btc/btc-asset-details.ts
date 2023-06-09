import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { btcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "../../types"

export class BtcAssetDetailsConnector extends FungibleAssetDetailsConnector {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return btcAsset
      .getRootAccount(principal, this.config.icon)
      .then((token) => {
        return [token]
      })
  }
}

export const btcAssetDetailsConnector = new BtcAssetDetailsConnector({
  tokenStandard: TokenStandards.BTC,
  icon: IconSvgBTC,
  blockchain: Blockchain.BITCOIN,
})

import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumGoerliAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class EthAssetDetailsConnector extends FungibleAssetDetailsConnector {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return ethereumGoerliAsset
      .getNativeAccount(principal, this.config.icon)
      .then((l) => [l])
  }
}

export const ethAssetDetailsConnector = new EthAssetDetailsConnector({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ETH,
})

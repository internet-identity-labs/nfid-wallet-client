import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsView } from "src/ui/view-model/fungible-account-details/fungible-asset-detail"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class EthAssetDetailsView extends FungibleAssetDetailsView {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return ethereumAsset
      .getNativeAccount(principal, this.config.icon)
      .then((l) => [l])
  }
}

export const ethAssetDetailsView = new EthAssetDetailsView({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ETH,
})

import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsView } from "src/ui/view-model/fungible-account-details/fungible-asset-detail"
import { Blockchain } from "src/ui/view-model/types"

import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class EthereumERC20AssetDetailsView extends FungibleAssetDetailsView {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return ethereumAsset.getAccounts(principal, this.config.icon)
  }
}

export const ethereumERC20AssetDetailsView = new EthereumERC20AssetDetailsView({
  tokenStandard: TokenStandards.ERC20,
  blockchain: Blockchain.ETHEREUM,
})

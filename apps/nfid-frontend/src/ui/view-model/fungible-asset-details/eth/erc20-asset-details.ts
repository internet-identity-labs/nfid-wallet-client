import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsConnector } from "src/ui/view-model/fungible-asset-details/fungible-asset-detail"
import { Blockchain } from "src/ui/view-model/types"

import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class EthereumERC20AssetDetailsConnector extends FungibleAssetDetailsConnector {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return ethereumAsset.getAccounts(principal, this.config.icon)
  }
}

export const ethereumERC20AssetDetailsConnector = new EthereumERC20AssetDetailsConnector({
  tokenStandard: TokenStandards.ERC20_ETHEREUM,
  blockchain: Blockchain.ETHEREUM,
})

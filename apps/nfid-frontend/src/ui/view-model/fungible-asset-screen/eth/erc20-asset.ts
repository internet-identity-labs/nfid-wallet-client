import { FungibleAssetView } from "src/ui/view-model/fungible-asset-screen/fungible-asset"
import { erc20ToTokenConfig } from "src/ui/view-model/fungible-asset-screen/util/util"
import { Blockchain, NativeToken, TokenConfig } from "src/ui/view-model/types"

import { IconERC20 } from "@nfid-frontend/ui"
import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class EthereumERC20AssetView extends FungibleAssetView {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return ethereumAsset.getAccounts(principal, this.config.icon).then((ts) => {
      return ts.map((l) => {
        return erc20ToTokenConfig(this.config, l)
      })
    })
  }
}

export const ethereumERC20AssetView = new EthereumERC20AssetView({
  tokenStandard: TokenStandards.ERC20_ETHEREUM,
  blockchain: Blockchain.ETHEREUM,
  feeCurrency: NativeToken.ETH,
  icon: IconERC20,
})

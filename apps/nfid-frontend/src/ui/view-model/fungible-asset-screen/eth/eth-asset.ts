import { FungibleAssetConnector } from "src/ui/view-model/fungible-asset-screen/fungible-asset"
import { nativeToTokenConfig } from "src/ui/view-model/fungible-asset-screen/util/util"
import { Blockchain, NativeToken, TokenConfig } from "src/ui/view-model/types"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class EthAssetConnector extends FungibleAssetConnector {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return ethereumAsset
      .getNativeAccount(principal, this.config.icon)
      .then((matic) => [nativeToTokenConfig(this.config, matic)])
  }
}

export const ethAssetConnector = new EthAssetConnector({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ETH,
  title: "Ethereum",
  currency: NativeToken.ETH,
  blockchain: Blockchain.ETHEREUM,
})

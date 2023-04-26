import { FungibleAssetView } from "src/ui/view-model/fungible-asset/fungible-asset";
import { Blockchain, NativeToken, TokenConfig } from "src/ui/view-model/fungible-asset/types";
import { nativeToTokenConfig } from "src/ui/view-model/fungible-asset/util/util";

import { IconPngEthereum } from "@nfid-frontend/ui";
import { ethereumAsset } from "@nfid/integration";
import { TokenStandards } from "@nfid/integration/token/types";

export class EthAssetView extends FungibleAssetView {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return ethereumAsset
      .getNativeAccount(principal, this.config.icon)
      .then((matic) => [nativeToTokenConfig(this.config, matic)])
  }
}

export const ethAssetView = new EthAssetView({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ETH,
  title: "Ethereum",
  currency: NativeToken.ETH,
  blockchain: Blockchain.ETHEREUM,
})

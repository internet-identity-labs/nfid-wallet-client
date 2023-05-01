import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { toNativeTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetNativeConfig,
  Blockchain,
  NativeToken,
  TokenConfig,
} from "src/ui/connnector/types"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class EthAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getTokenConfigs(): Promise<Array<TokenConfig>> {
    const principal = await this.getIdentity()
    return ethereumAsset
      .getNativeAccount(principal, this.config.icon)
      .then((matic) => [toNativeTokenConfig(this.config, matic)])
  }
}

export const ethAssetConnector = new EthAssetConnector({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ETH,
  title: "Ethereum",
  feeCurrency: NativeToken.ETH,
  blockchain: Blockchain.ETHEREUM,
})

import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "../../types"

export class EthAssetDetailsConnector extends FungibleAssetDetailsConnector {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return ethereumAsset
      .getNativeAccount(principal, this.config.icon)
      .then((l) => [l])
  }
}

export const ethAssetDetailsConnector = new EthAssetDetailsConnector({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ETH,
  blockchain: Blockchain.ETHEREUM,
})

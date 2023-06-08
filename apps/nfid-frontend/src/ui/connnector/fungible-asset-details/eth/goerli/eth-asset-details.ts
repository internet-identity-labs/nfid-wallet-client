import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumGoerliAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

export class EthGoerliAssetDetailsConnector extends FungibleAssetDetailsConnector {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return ethereumGoerliAsset
      .getNativeAccount(principal, this.config.icon)
      .then((l) => [l])
  }
}

export const ethGoerliAssetDetailsConnector =
  new EthGoerliAssetDetailsConnector({
    icon: IconPngEthereum,
    tokenStandard: TokenStandards.ETH,
    blockchain: Blockchain.ETHEREUM_GOERLI,
  })

import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"

import { IconERC20 } from "@nfid-frontend/ui"
import { ethereumGoerliAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

export class EthereumGoerliERC20AssetDetailsConnector extends FungibleAssetDetailsConnector {
  async getAssetDetails(): Promise<Array<TokenBalanceSheet>> {
    const principal = await this.getIdentity()
    return ethereumGoerliAsset.getAccounts(principal, this.config.icon)
  }
}

export const ethereumGoerliERC20AssetDetailsConnector =
  new EthereumGoerliERC20AssetDetailsConnector({
    tokenStandard: TokenStandards.ERC20_ETHEREUM,
    icon: IconERC20,
    blockchain: Blockchain.ETHEREUM_GOERLI,
  })

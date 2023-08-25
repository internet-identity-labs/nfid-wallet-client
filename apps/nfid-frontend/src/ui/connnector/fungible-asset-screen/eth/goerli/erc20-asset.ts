import { DelegationIdentity } from "@dfinity/identity"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { erc20ToTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetErc20Config,
  Blockchain,
  ETHNetwork,
  NativeToken,
  TokenConfig,
} from "src/ui/connnector/types"

import { IconERC20 } from "@nfid-frontend/ui"
import { NetworkKey } from "@nfid/client-db"
import { ethereumGoerliAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class EthereumGoerliERC20AssetConnector extends FungibleAssetConnector<AssetErc20Config> {
  async getAccounts(
    identity: DelegationIdentity[],
  ): Promise<Array<TokenConfig>> {
    return ethereumGoerliAsset
      .getAccounts(
        identity[0],
        this.config.icon,
        await this.getCachedAddress(NetworkKey.EVM),
      )
      .then((ts) => {
        return ts.map((l) => {
          return erc20ToTokenConfig(this.config, l)
        })
      })
  }
}

export const ethereumGoerliERC20AssetConnector =
  new EthereumGoerliERC20AssetConnector({
    tokenStandard: TokenStandards.ERC20_ETHEREUM,
    blockchain: Blockchain.ETHEREUM_GOERLI,
    feeCurrency: NativeToken.ETH,
    icon: IconERC20,
    network: ETHNetwork.GOERLI,
  })

import { DelegationIdentity } from "@dfinity/identity";
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset";
import { toNativeTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util";
import { AssetNativeConfig, Blockchain, ETHNetwork, NativeToken, TokenConfig } from "src/ui/connnector/types";



import { IconPngEthereum } from "@nfid-frontend/ui";
import { ethereumGoerliAsset } from "@nfid/integration";
import { TokenStandards } from "@nfid/integration/token/types";


export class EthGoerliAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getAccounts(
    identity: DelegationIdentity[],
  ): Promise<Array<TokenConfig>> {
    return ethereumGoerliAsset
      .getNativeAccount(identity[0], this.config.icon)
      .then((matic) => [toNativeTokenConfig(this.config, matic)])
  }
}

export const ethGoerliAssetConnector = new EthGoerliAssetConnector({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ETH,
  title: "Ethereum Goerli",
  feeCurrency: NativeToken.ETH,
  blockchain: Blockchain.ETHEREUM_GOERLI,
  network: ETHNetwork.GOERLI,
})
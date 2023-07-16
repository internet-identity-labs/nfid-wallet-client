import { DelegationIdentity } from "@dfinity/identity"
import { btcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { toNativeTokenConfig } from "src/ui/connnector/fungible-asset-screen/util/util"
import {
  AssetNativeConfig,
  Blockchain,
  BTCNetwork,
  NativeToken,
  TokenConfig,
} from "src/ui/connnector/types"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export class BtcAssetConnector extends FungibleAssetConnector<AssetNativeConfig> {
  async getAccounts(
    identity: DelegationIdentity[],
  ): Promise<Array<TokenConfig>> {
    return btcAsset.getRootAccount(identity[0], IconSvgBTC).then((token) => {
      return [toNativeTokenConfig(this.config, token)]
    })
  }

  protected getIdentity = async (
    filterPrincipals?: string[],
  ): Promise<DelegationIdentity[]> => {
    const { delegationIdentity } = authState.get()
    if (!delegationIdentity) {
      throw Error("Delegation identity error")
    }
    return !filterPrincipals?.length ||
      filterPrincipals?.includes(delegationIdentity.getPrincipal().toString())
      ? [delegationIdentity]
      : []
  }
}

export const btcAssetConnector = new BtcAssetConnector({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.BTC,
  title: "Bitcoin",
  feeCurrency: NativeToken.BTC,
  blockchain: Blockchain.BITCOIN,
  network: BTCNetwork.MAINNET,
})

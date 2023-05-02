import { DelegationIdentity } from "@dfinity/identity"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import {
  AssetNativeConfig,
  AssetErc20Config,
  IFungibleAssetConnector,
  TokenConfig,
} from "src/ui/connnector/types"

import { loadProfileFromLocalStorage } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export abstract class FungibleAssetConnector<
  T extends AssetNativeConfig | AssetErc20Config,
> implements IFungibleAssetConnector
{
  protected config: T

  constructor(config: T) {
    this.config = config
  }

  abstract getTokenConfigs(): Promise<Array<TokenConfig>>

  getTokenStandard(): TokenStandards {
    return this.config.tokenStandard
  }

  protected getIdentity = async (
    filterPrincipals?: string[],
  ): Promise<DelegationIdentity | undefined> => {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    const identity = await getWalletDelegation(profile.anchor, "nfid.one", "0")

    if (
      !filterPrincipals?.length ||
      filterPrincipals?.includes(identity.getPrincipal().toString())
    )
      return identity
  }
}

import { DelegationIdentity } from "@dfinity/identity"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import {
  AssetErc20Config,
  AssetFilter,
  AssetNativeConfig,
  IFungibleAssetConnector,
  TokenConfig,
} from "src/ui/connnector/types"

import { loadProfileFromLocalStorage } from "@nfid/integration"

export abstract class FungibleAssetConnector<
  T extends AssetNativeConfig | AssetErc20Config,
> implements IFungibleAssetConnector
{
  protected config: T

  constructor(config: T) {
    this.config = config
  }

  async getTokenConfigs(
    assetFilter: AssetFilter[],
  ): Promise<Array<TokenConfig>> {
    const identity = await this.getIdentity(
      assetFilter.map((filter) => filter.principal),
    )
    return identity.length === 0 ? [] : this.getAccounts(identity)
  }

  abstract getAccounts(
    identity: DelegationIdentity[],
  ): Promise<Array<TokenConfig>>

  getTokenStandard(): string {
    return `${this.config.tokenStandard}&${this.config.blockchain}`
  }

  protected getIdentity = async (
    filterPrincipals?: string[],
  ): Promise<DelegationIdentity[]> => {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    const identity = await getWalletDelegation(profile.anchor, "nfid.one", "0")

    return !filterPrincipals?.length ||
      filterPrincipals?.includes(identity.getPrincipal().toString())
      ? [identity]
      : []
  }

  getCacheTtl(): number {
    return 30
  }
}

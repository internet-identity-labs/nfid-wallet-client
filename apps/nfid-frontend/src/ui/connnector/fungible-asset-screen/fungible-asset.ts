import { DelegationIdentity } from "@dfinity/identity"
import {
  AssetErc20Config,
  AssetFilter,
  AssetNativeConfig,
  IFungibleAssetConnector,
  TokenConfig,
} from "src/ui/connnector/types"

import { authState } from "@nfid/integration"

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
    const { delegationIdentity } = authState.get()
    if (!delegationIdentity) {
      throw Error("Delegation identity error")
    }
    return !filterPrincipals?.length ||
      filterPrincipals?.includes(delegationIdentity.getPrincipal().toString())
      ? [delegationIdentity]
      : []
  }

  getCacheTtl(): number {
    return 30
  }
}

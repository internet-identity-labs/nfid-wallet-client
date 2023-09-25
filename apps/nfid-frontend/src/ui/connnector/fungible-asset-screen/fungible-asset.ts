import { DelegationIdentity } from "@dfinity/identity"
import { Cache } from "node-ts-cache"
import {
  AssetErc20Config,
  AssetFilter,
  AssetNativeConfig,
  IFungibleAssetConnector,
  TokenConfig,
} from "src/ui/connnector/types"

import { NetworkKey, readAddressFromLocalCache } from "@nfid/client-db"
import { authState } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"

import { connectorCache } from "../cache"

export abstract class FungibleAssetConnector<
  T extends AssetNativeConfig | AssetErc20Config,
> implements IFungibleAssetConnector
{
  protected config: T

  constructor(config: T) {
    this.config = config
  }

  async getTokenConfigs(
    assetFilter: AssetFilter[] = [],
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
    return [delegationIdentity]
  }

  @Cache(connectorCache, { ttl: 3600 })
  protected async getProfileAnchor() {
    return BigInt((await fetchProfile()).anchor)
  }

  protected async getCachedAddress(chain: NetworkKey) {
    const cachedAddress = readAddressFromLocalCache({
      accountId: "-1",
      hostname: "nfid.one",
      anchor: await this.getProfileAnchor(),
      network: chain,
    })

    return cachedAddress
  }

  getCacheTtl(): number {
    return 30
  }
}

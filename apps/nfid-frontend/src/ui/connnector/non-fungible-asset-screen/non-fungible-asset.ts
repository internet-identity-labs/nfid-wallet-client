import { DelegationIdentity } from "@dfinity/identity"
import { NonFungibleItem } from "packages/integration/src/lib/asset/types"
import { UserNonFungibleToken } from "src/features/non-fungable-token/types"
import { toUserNFT } from "src/ui/connnector/non-fungible-asset-screen/util/util"
import {
  AssetFilter,
  Blockchain,
  INonFungibleAssetConnector,
  NftConnectorConfig,
} from "src/ui/connnector/types"

import { authState } from "@nfid/integration"

export abstract class NonFungibleAssetConnector<T extends NftConnectorConfig>
  implements INonFungibleAssetConnector
{
  protected config: T

  constructor(config: T) {
    this.config = config
  }

  async getNonFungibleItems(
    assetFilter: AssetFilter[],
  ): Promise<Array<UserNonFungibleToken>> {
    const identities = await this.getIdentity(
      assetFilter.map((filter) => filter.principal),
    )
    let nfts: UserNonFungibleToken[] = []

    await Promise.all(
      identities.map(async (identity) => {
        const items = await this.config.assetService.getItemsByUser({
          identity,
        })
        const userNFTS = items.items.map((nft: NonFungibleItem) =>
          toUserNFT(nft, identity.getPrincipal(), this.config),
        )
        nfts = [...nfts, ...userNFTS]
      }),
    )
    return nfts
  }

  getTokenStandard(): Blockchain {
    return this.config.blockchain
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

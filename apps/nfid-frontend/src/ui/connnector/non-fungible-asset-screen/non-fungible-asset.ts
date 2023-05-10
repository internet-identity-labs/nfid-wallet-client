import {AssetFilter, Blockchain, INonFungibleAssetConnector, NftConnectorConfig} from "src/ui/connnector/types";
import {UserNonFungibleToken} from "src/features/non-fungable-token/types";
import {DelegationIdentity} from "@dfinity/identity";
import {loadProfileFromLocalStorage} from "@nfid/integration";
import {fetchProfile} from "src/integration/identity-manager";
import {getWalletDelegation} from "src/integration/facade/wallet";
import {toUserNFT} from "src/ui/connnector/non-fungible-asset-screen/util/util";
import {NonFungibleItem} from "packages/integration/src/lib/asset/types"

export abstract class NonFungibleAssetConnector<T extends NftConnectorConfig> implements INonFungibleAssetConnector {
  protected config: T

  constructor(config: T) {
    this.config = config
  }

  async getNonFungibleItems(assetFilter: AssetFilter[]): Promise<Array<UserNonFungibleToken>> {
    const identities = await this.getIdentity(
      assetFilter.map((filter) => filter.principal),
    )
    let nfts: UserNonFungibleToken[] = [];

    await Promise.all(identities.map(async (identity) => {
      const items = await this.config.assetService.getItemsByUser({identity});
      const userNFTS = items.items.map((nft: NonFungibleItem) => toUserNFT(nft, identity.getPrincipal(), this.config));
      nfts = [...nfts, ...userNFTS];
    }));
    return nfts;
  }

   getTokenStandard(): Blockchain {
    return this.config.blockchain
  };

  protected getIdentity = async (
    filterPrincipals: string[],
  ): Promise<DelegationIdentity[]> => {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    const identity = await getWalletDelegation(profile.anchor, "nfid.one", "0")
    return !filterPrincipals.length ||
    filterPrincipals.includes(identity.getPrincipal().toString())
      ? [identity] : []
  }

  getCacheTtl(): number {
    return 30;
  }
}

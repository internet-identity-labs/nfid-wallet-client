import { UserNonFungibleToken } from "src/features/non-fungable-token/types"
import { ConnectorFactory } from "src/ui/connnector/connector-factory"
import { NonFungibleAssetConnector } from "src/ui/connnector/non-fungible-asset-screen/non-fungible-asset"
import {
  AssetFilter,
  Blockchain,
  NftConnectorConfig,
} from "src/ui/connnector/types"

export class NftFactory extends ConnectorFactory<
  Blockchain,
  NonFungibleAssetConnector<NftConnectorConfig>
> {
  getNFToken = async (
    blockchain: Blockchain,
    assetFilters: AssetFilter[],
  ): Promise<Array<UserNonFungibleToken>> => {
    return this.process(blockchain, [assetFilters])
  }

  getCacheKey(key: Blockchain, functionToCall: Function, args: any[]): string {
    return (
      functionToCall.name +
      key +
      (args[0]! as AssetFilter[]).reduce(
        (acc, { principal }) => `${acc}${principal}`,
        "",
      )
    )
  }

  getFunctionToCall(
    connector: NonFungibleAssetConnector<NftConnectorConfig>,
  ): Function {
    return connector.getNonFungibleItems
  }
}

export const nftFactory = new NftFactory([])

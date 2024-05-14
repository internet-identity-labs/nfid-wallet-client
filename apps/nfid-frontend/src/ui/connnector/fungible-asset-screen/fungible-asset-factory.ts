import { ConnectorFactory } from "src/ui/connnector/connector-factory"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import {
  AssetErc20Config,
  AssetNativeConfig,
  TokenConfig,
} from "src/ui/connnector/types"

export class FungibleAssetFactory extends ConnectorFactory<
  string,
  FungibleAssetConnector<AssetNativeConfig | AssetErc20Config>
> {
  getTokenConfigs = async (key: string): Promise<Array<TokenConfig>> => {
    return super.process(key, [])
  }

  getFunctionToCall(
    connector: FungibleAssetConnector<AssetNativeConfig | AssetErc20Config>,
  ): Function {
    return connector.getTokenConfigs
  }
}

export const fungibleAssetFactory = new FungibleAssetFactory([])

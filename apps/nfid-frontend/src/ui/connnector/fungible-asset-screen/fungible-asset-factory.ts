import { ConnectorFactory } from "src/ui/connnector/connector-factory"
import { btcAssetConnector } from "src/ui/connnector/fungible-asset-screen/btc/btc-asset"
import { ethereumERC20AssetConnector } from "src/ui/connnector/fungible-asset-screen/eth/erc20-asset"
import { ethAssetConnector } from "src/ui/connnector/fungible-asset-screen/eth/eth-asset"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { polygonERC20AssetConnector } from "src/ui/connnector/fungible-asset-screen/polygon/erc20-asset"
import { maticAssetConnector } from "src/ui/connnector/fungible-asset-screen/polygon/matic-asset"
import {
  AssetErc20Config,
  AssetFilter,
  AssetNativeConfig,
  TokenConfig,
} from "src/ui/connnector/types"

import { TokenStandards } from "@nfid/integration/token/types"

export class FungibleAssetFactory extends ConnectorFactory<
  TokenStandards,
  FungibleAssetConnector<AssetNativeConfig | AssetErc20Config>
> {
  getTokenConfigs = async (
    key: TokenStandards,
    assetFilters: AssetFilter[],
  ): Promise<Array<TokenConfig>> => {
    return super.process(key, [assetFilters])
  }

  getCacheKey(
    key: TokenStandards,
    functionToCall: Function,
    args: any[],
  ): string {
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
    connector: FungibleAssetConnector<AssetNativeConfig | AssetErc20Config>,
  ): Function {
    return connector.getTokenConfigs
  }
}

export const fungibleAssetFactory = new FungibleAssetFactory([
  btcAssetConnector,
  maticAssetConnector,
  polygonERC20AssetConnector,
  ethereumERC20AssetConnector,
  ethAssetConnector,
])

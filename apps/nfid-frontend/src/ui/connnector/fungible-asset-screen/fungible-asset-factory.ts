import { ConnectorFactory } from "src/ui/connnector/connector-factory"
import { btcAssetConnector } from "src/ui/connnector/fungible-asset-screen/btc/btc-asset"
import { ethereumERC20AssetConnector } from "src/ui/connnector/fungible-asset-screen/eth/erc20-asset"
import { ethAssetConnector } from "src/ui/connnector/fungible-asset-screen/eth/eth-asset"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { polygonERC20AssetConnector } from "src/ui/connnector/fungible-asset-screen/polygon/erc20-asset"
import { maticAssetConnector } from "src/ui/connnector/fungible-asset-screen/polygon/matic-asset"
import {
  AssetErc20Config,
  AssetNativeConfig,
  TokenConfig,
} from "src/ui/connnector/types"

import { polygonMumbaiERC20AssetConnector } from "./polygon/mumbai/erc20-asset"
import { maticMumbaiAssetConnector } from "./polygon/mumbai/matic-asset"

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

export const fungibleAssetFactory = new FungibleAssetFactory([
  btcAssetConnector,
  maticAssetConnector,
  polygonERC20AssetConnector,
  ethereumERC20AssetConnector,
  ethAssetConnector,
  maticMumbaiAssetConnector,
  polygonMumbaiERC20AssetConnector,
  // ethereumGoerliERC20AssetConnector,
  // ethGoerliAssetConnector,
])

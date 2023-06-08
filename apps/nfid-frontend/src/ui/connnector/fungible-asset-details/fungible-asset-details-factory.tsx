import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { ConnectorFactory } from "src/ui/connnector/connector-factory"
import { btcAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/btc/btc-asset-details"
import { ethereumERC20AssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/eth/erc20-asset-details"
import { ethAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/eth/eth-asset-details"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"
import { polygonERC20AssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/polygon/erc20-asset-details"
import { maticAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/polygon/matic-asset-details"

import { TokenStandards } from "@nfid/integration/token/types"

import { ethereumGoerliERC20AssetDetailsConnector } from "./eth/goerli/erc20-asset-details"
import { ethGoerliAssetDetailsConnector } from "./eth/goerli/eth-asset-details"
import { polygonMumbaiERC20AssetDetailsConnector } from "./polygon/mumbai/erc20-asset-details"
import { maticMumbaiAssetDetailsConnector } from "./polygon/mumbai/matic-asset-details"

export class FungibleAssetDetailsFactory extends ConnectorFactory<
  string,
  FungibleAssetDetailsConnector
> {
  getAssetDetails = async (key: string): Promise<Array<TokenBalanceSheet>> => {
    return this.process(key, [])
  }

  getCacheKey(key: TokenStandards, functionToCall: Function, args: []): string {
    return functionToCall.name + key
  }

  getFunctionToCall(connector: FungibleAssetDetailsConnector): Function {
    return connector.getAssetDetails
  }
}

export const fungibleAssetDetailsFactory = new FungibleAssetDetailsFactory([
  btcAssetDetailsConnector,
  maticAssetDetailsConnector,
  maticMumbaiAssetDetailsConnector,
  polygonERC20AssetDetailsConnector,
  polygonMumbaiERC20AssetDetailsConnector,
  ethAssetDetailsConnector,
  ethGoerliAssetDetailsConnector,
  ethereumERC20AssetDetailsConnector,
  ethereumGoerliERC20AssetDetailsConnector,
])

import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { ConnectorFactory } from "src/ui/connnector/connector-factory"
import { btcAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/btc/btc-asset-details"
import { ethereumERC20AssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/eth/erc20-asset-details"
import { ethAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/eth/eth-asset-details"
import { FungibleAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/fungible-asset-detail"
import { polygonERC20AssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/polygon/erc20-asset-details"
import { maticAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/polygon/matic-asset-details"

import { TokenStandards } from "@nfid/integration/token/types"

export class FungibleAssetDetailsFactory extends ConnectorFactory<
  TokenStandards,
  FungibleAssetDetailsConnector
> {
  getAssetDetails = async (
    key: TokenStandards,
  ): Promise<Array<TokenBalanceSheet>> => {
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
  polygonERC20AssetDetailsConnector,
  ethAssetDetailsConnector,
  ethereumERC20AssetDetailsConnector,
])

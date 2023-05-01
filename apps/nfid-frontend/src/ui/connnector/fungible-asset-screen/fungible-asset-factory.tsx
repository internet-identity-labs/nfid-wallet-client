import { btcAssetConnector } from "src/ui/connnector/fungible-asset-screen/btc/btc-asset"
import { ethereumERC20AssetConnector } from "src/ui/connnector/fungible-asset-screen/eth/erc20-asset"
import { ethAssetConnector } from "src/ui/connnector/fungible-asset-screen/eth/eth-asset"
import { FungibleAssetConnector } from "src/ui/connnector/fungible-asset-screen/fungible-asset"
import { polygonERC20AssetConnector } from "src/ui/connnector/fungible-asset-screen/polygon/erc20-asset"
import { maticAssetConnector } from "src/ui/connnector/fungible-asset-screen/polygon/matic-asset"
import {
  AssetErc20Config,
  AssetNativeConfig,
  IFungibleAssetConnector,
  TokenConfig,
} from "src/ui/connnector/types"

import { TokenStandards } from "@nfid/integration/token/types"

const assetViews = [
  btcAssetConnector,
  maticAssetConnector,
  polygonERC20AssetConnector,
  ethereumERC20AssetConnector,
  ethAssetConnector,
]

const assetViewConfigStorage: Map<TokenStandards, IFungibleAssetConnector> =
  toMap(assetViews)

export const getAssetScreenTokens = (): Array<TokenStandards> => {
  return Array.from(assetViewConfigStorage.keys())
}

export const getTokens = async (
  asset: TokenStandards,
): Promise<Array<TokenConfig>> => {
  const conf = await assetViewConfigStorage.get(asset)!
  return conf.getTokenConfigs()
}

function toMap(
  assetViews: FungibleAssetConnector<AssetNativeConfig | AssetErc20Config>[],
): Map<TokenStandards, IFungibleAssetConnector> {
  const assetViewMap = new Map<
    TokenStandards,
    FungibleAssetConnector<AssetNativeConfig | AssetErc20Config>
  >()
  assetViews.forEach((assetView) => {
    assetViewMap.set(assetView.getTokenStandard(), assetView)
  })
  return assetViewMap
}

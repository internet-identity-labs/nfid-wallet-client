import { btcAssetView } from "src/ui/view-model/fungible-asset/btc/btc-asset"
import { ethereumERC20AssetView } from "src/ui/view-model/fungible-asset/eth/erc20-asset"
import { ethAssetView } from "src/ui/view-model/fungible-asset/eth/eth-asset"
import { FungibleAssetView } from "src/ui/view-model/fungible-asset/fungible-asset"
import { polygonERC20AssetView } from "src/ui/view-model/fungible-asset/polygon/erc20-asset"
import { maticAssetView } from "src/ui/view-model/fungible-asset/polygon/matic-asset"
import {
  FungibleAssetViewI,
  TokenConfig,
} from "src/ui/view-model/fungible-asset/types"

import { TokenStandards } from "@nfid/integration/token/types"

const assetViews = [
  btcAssetView,
  maticAssetView,
  polygonERC20AssetView,
  ethereumERC20AssetView,
  ethAssetView,
]

const assetViewConfigStorage: Map<TokenStandards, FungibleAssetViewI> =
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
  assetViews: FungibleAssetView[],
): Map<TokenStandards, FungibleAssetViewI> {
  const assetViewMap = new Map<TokenStandards, FungibleAssetView>()
  assetViews.forEach((assetView) => {
    assetViewMap.set(assetView.getTokenStandard(), assetView)
  })
  return assetViewMap
}

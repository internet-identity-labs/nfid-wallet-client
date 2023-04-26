import { btcAssetView } from "src/ui/view-model/fungible-asset-screen/btc/btc-asset"
import { ethereumERC20AssetView } from "src/ui/view-model/fungible-asset-screen/eth/erc20-asset"
import { ethAssetView } from "src/ui/view-model/fungible-asset-screen/eth/eth-asset"
import { FungibleAssetView } from "src/ui/view-model/fungible-asset-screen/fungible-asset"
import { polygonERC20AssetView } from "src/ui/view-model/fungible-asset-screen/polygon/erc20-asset"
import { maticAssetView } from "src/ui/view-model/fungible-asset-screen/polygon/matic-asset"
import { IFungibleAssetView, TokenConfig } from "src/ui/view-model/types"

import { TokenStandards } from "@nfid/integration/token/types"

const assetViews = [
  btcAssetView,
  maticAssetView,
  polygonERC20AssetView,
  ethereumERC20AssetView,
  ethAssetView,
]

const assetViewConfigStorage: Map<TokenStandards, IFungibleAssetView> =
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
): Map<TokenStandards, IFungibleAssetView> {
  const assetViewMap = new Map<TokenStandards, FungibleAssetView>()
  assetViews.forEach((assetView) => {
    assetViewMap.set(assetView.getTokenStandard(), assetView)
  })
  return assetViewMap
}

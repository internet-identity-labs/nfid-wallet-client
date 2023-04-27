import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { btcAssetDetailsConnector } from "src/ui/view-model/fungible-asset-details/btc/btc-asset-details"
import { ethereumERC20AssetDetailsConnector } from "src/ui/view-model/fungible-asset-details/eth/erc20-asset-details"
import { ethAssetDetailsConnector } from "src/ui/view-model/fungible-asset-details/eth/eth-asset-details"
import { polygonERC20AssetDetailsConnector } from "src/ui/view-model/fungible-asset-details/polygon/erc20-asset-details"
import { maticAssetDetailsConnector } from "src/ui/view-model/fungible-asset-details/polygon/matic-asset-details"
import { IFungibleAssetDetailsConnector } from "src/ui/view-model/types"

import { TokenStandards } from "@nfid/integration/token/types"

const accountViews = [
  btcAssetDetailsConnector as IFungibleAssetDetailsConnector,
  maticAssetDetailsConnector as IFungibleAssetDetailsConnector,
  polygonERC20AssetDetailsConnector as IFungibleAssetDetailsConnector,
  ethAssetDetailsConnector as IFungibleAssetDetailsConnector,
  ethereumERC20AssetDetailsConnector as IFungibleAssetDetailsConnector,
]

const assetAccountStorage: Map<TokenStandards, IFungibleAssetDetailsConnector> =
  toMap(accountViews)

export const getAssetDetailsTokens = (): Array<TokenStandards> => {
  return Array.from(assetAccountStorage.keys())
}

export const getAssetDetails = async (
  asset: TokenStandards,
): Promise<Array<TokenBalanceSheet>> => {
  const conf = await assetAccountStorage.get(asset)!
  return conf.getAssetDetails()
}

function toMap(
  assetViews: IFungibleAssetDetailsConnector[],
): Map<TokenStandards, IFungibleAssetDetailsConnector> {
  const assetViewMap = new Map<TokenStandards, IFungibleAssetDetailsConnector>()
  assetViews.forEach((assetView) => {
    assetViewMap.set(assetView.getTokenStandard(), assetView)
  })
  return assetViewMap
}

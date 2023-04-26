import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { btcAssetDetailsView } from "src/ui/view-model/fungible-account-details/btc/btc-asset-details"
import { ethereumERC20AssetDetailsView } from "src/ui/view-model/fungible-account-details/eth/erc20-asset-details"
import { ethAssetDetailsView } from "src/ui/view-model/fungible-account-details/eth/eth-asset-details"
import { polygonERC20AssetDetailsView } from "src/ui/view-model/fungible-account-details/polygon/erc20-asset-details"
import { maticAssetDetailsView } from "src/ui/view-model/fungible-account-details/polygon/matic-asset-details"
import { IFungibleAccountView } from "src/ui/view-model/types"

import { TokenStandards } from "@nfid/integration/token/types"

const accountViews = [
  btcAssetDetailsView as IFungibleAccountView,
  maticAssetDetailsView as IFungibleAccountView,
  polygonERC20AssetDetailsView as IFungibleAccountView,
  ethAssetDetailsView as IFungibleAccountView,
  ethereumERC20AssetDetailsView as IFungibleAccountView,
]

const assetAccountStorage: Map<TokenStandards, IFungibleAccountView> =
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
  assetViews: IFungibleAccountView[],
): Map<TokenStandards, IFungibleAccountView> {
  const assetViewMap = new Map<TokenStandards, IFungibleAccountView>()
  assetViews.forEach((assetView) => {
    assetViewMap.set(assetView.getTokenStandard(), assetView)
  })
  return assetViewMap
}

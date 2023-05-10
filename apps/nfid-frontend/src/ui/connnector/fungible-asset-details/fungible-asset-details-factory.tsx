import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { btcAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/btc/btc-asset-details"
import { ethereumERC20AssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/eth/erc20-asset-details"
import { ethAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/eth/eth-asset-details"
import { polygonERC20AssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/polygon/erc20-asset-details"
import { maticAssetDetailsConnector } from "src/ui/connnector/fungible-asset-details/polygon/matic-asset-details"
import { IFungibleAssetDetailsConnector } from "src/ui/connnector/types"

import { TokenStandards } from "@nfid/integration/token/types"

import { connectorCache } from "../cache"

const accountConnectors = [
  btcAssetDetailsConnector,
  maticAssetDetailsConnector,
  polygonERC20AssetDetailsConnector,
  ethAssetDetailsConnector,
  ethereumERC20AssetDetailsConnector,
]

const assetAccountStorage: Map<TokenStandards, IFungibleAssetDetailsConnector> =
  toMap(accountConnectors)

export const getAssetDetailsTokens = (): Array<TokenStandards> => {
  return Array.from(assetAccountStorage.keys())
}

export const getAssetDetails = async (
  asset: TokenStandards,
): Promise<Array<TokenBalanceSheet>> => {
  const conf = await assetAccountStorage.get(asset)!
  const cacheKey = "getAssetDetails" + asset
  console.debug("getAssetDetails cache hit:", { cacheKey })
  const cachedAssetDetails = await connectorCache.getItem<TokenBalanceSheet[]>(
    cacheKey,
  )
  if (cachedAssetDetails) {
    console.debug("getAssetDetails cache hit:", {
      cacheKey,
      cachedAssetDetails,
    })
    return cachedAssetDetails
  }

  const response = await conf.getAssetDetails()
  console.debug("getAssetDetails refresh cache:", { cacheKey, response })
  await connectorCache.setItem(cacheKey, response, {
    ttl: 30,
  })

  return response
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

import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"
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
  IFungibleAssetConnector,
  TokenConfig,
} from "src/ui/connnector/types"

import { TokenStandards as TokenStandard } from "@nfid/integration/token/types"

import { connectorCache } from "../cache"

const assetViews = [
  btcAssetConnector,
  maticAssetConnector,
  polygonERC20AssetConnector,
  ethereumERC20AssetConnector,
  ethAssetConnector,
]

const assetViewConfigStorage: Map<TokenStandard, IFungibleAssetConnector> =
  toMap(assetViews)

export const getAssetScreenTokens = (): Array<TokenStandard> => {
  return Array.from(assetViewConfigStorage.keys())
}

export const getToken = async (
  asset: TokenStandard,
  assetFilters: AssetFilter[],
): Promise<Array<TokenConfig>> => {
  const conf = assetViewConfigStorage.get(asset)!
  const cacheKey =
    "getTokensConfig" +
    asset +
    assetFilters.reduce((acc, { principal }) => `${acc}${principal}`, "")
  console.debug("getToken cache hit:", { cacheKey })
  const cachedTokenConfig = await connectorCache.getItem<TokenConfig[]>(
    cacheKey,
  )

  if (cachedTokenConfig) {
    console.debug("getToken cache hit:", { cacheKey, cachedTokenConfig })
    return cachedTokenConfig
  }

  const response = await conf.getTokenConfigs(assetFilters)
  console.debug("getToken refresh cache:", { cacheKey, response })
  await connectorCache.setItem(cacheKey, response, {
    ttl: 30,
  })

  return response
}

function toMap(
  assetViews: FungibleAssetConnector<AssetNativeConfig | AssetErc20Config>[],
): Map<TokenStandard, IFungibleAssetConnector> {
  const assetViewMap = new Map<
    TokenStandard,
    FungibleAssetConnector<AssetNativeConfig | AssetErc20Config>
  >()
  assetViews.forEach((assetView) => {
    assetViewMap.set(assetView.getTokenStandard(), assetView)
  })
  return assetViewMap
}

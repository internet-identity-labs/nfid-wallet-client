import { Principal } from "@icp-sdk/core/principal"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import { arbitrumService } from "frontend/integration/ethereum/arbitrum/arbitrum.service"
import { baseService } from "frontend/integration/ethereum/base/base.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { polygonService } from "frontend/integration/ethereum/polygon/polygon.service"
import { EvmNftImpl } from "src/integration/nft/impl/evm/nft-evm"
import { nftMapper } from "src/integration/nft/impl/nft-mapper"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { NFT } from "src/integration/nft/nft"
import { entrepotSource } from "src/integration/nft/sources/entrepot-source"
import { extFloorPriceService } from "src/integration/nft/sources/ext-floor-price"
import {
  ICRC7_FLOOR_PRICE_CACHE_NAME,
  ICRC7_NFT_COLLECTIONS_CACHE_NAME,
  icrc7Source,
} from "src/integration/nft/sources/icrc7-source"
import { IcpNftToken } from "src/integration/nft/sources/nft-sources-types"
import { ENTREPOT_COLLECTIONS_CACHE_NAME } from "src/integration/nft/sources/entrepot-source"
import { EXT_FLOOR_PRICE_CACHE_NAME } from "src/integration/nft/sources/ext-floor-price"

import { ttlCacheService } from "@nfid/client-db"
import { exchangeRateService } from "@nfid/integration"
import { mutate } from "@nfid/swr"

import type { FT } from "../ft/ft"

const USER_NFTS_TTL_MS = 5 * 60 * 1000
const EXT_USER_NFTS_CACHE_NAME = "ICP_NFT_EXT_USER_"
const ICRC7_USER_NFTS_CACHE_NAME = "ICP_NFT_ICRC7_USER_"

/** Cache keys (prefixes) of every ICP NFT source, for a manual refresh. */
export const ICP_NFT_CACHE_NAMES = [
  EXT_USER_NFTS_CACHE_NAME,
  ICRC7_USER_NFTS_CACHE_NAME,
  ENTREPOT_COLLECTIONS_CACHE_NAME,
  EXT_FLOOR_PRICE_CACHE_NAME,
  ICRC7_NFT_COLLECTIONS_CACHE_NAME,
  ICRC7_FLOOR_PRICE_CACHE_NAME,
]

const NFT_SWR_KEYS = ["nftList", "nftTotalPrice"]

/** Re-renders the NFT list and totals after a background refresh. */
const revalidateNftViews = () =>
  mutate((key: unknown) => {
    const first = Array.isArray(key) ? key[0] : key
    if (typeof first !== "string") return false
    return NFT_SWR_KEYS.some(
      (k) => first === k || first.startsWith(k) || first.startsWith(`["${k}"`),
    )
  })

export class NftService {
  /**
   * ICP NFTs of `userPrincipal`: EXT/legacy from Entrepot and ICRC-7 from the
   * marketplace oracle collections. Each source is cached and returned from
   * cache at once, then refreshed in the background; a failing source falls
   * back to its cache (or nothing) without failing the other one.
   *
   * @param isOwnWallet hides ICRC-7 collections the user set Inactive.
   */
  async getICPNFTs(
    userPrincipal: Principal,
    isOwnWallet = true,
  ): Promise<NFT[]> {
    const principal = userPrincipal.toText()
    const [ext, icrc7] = await Promise.all([
      this.cachedSource(`${EXT_USER_NFTS_CACHE_NAME}${principal}`, () =>
        entrepotSource.getUserTokens(userPrincipal),
      ).then((tokens) => this.withExtFloorPrices(tokens)),
      this.cachedSource(
        `${ICRC7_USER_NFTS_CACHE_NAME}${principal}_${isOwnWallet}`,
        () => icrc7Source.getUserTokens(userPrincipal, isOwnWallet),
      ),
    ])
    const nfts = [...ext, ...icrc7].map(nftMapper.toNFT)
    await Promise.all(nfts.map((nft) => nft.init()))
    return nfts
  }

  private async cachedSource(
    key: string,
    fetcher: () => Promise<IcpNftToken[]>,
  ): Promise<IcpNftToken[]> {
    try {
      return await ttlCacheService.getOrFetch(key, fetcher, USER_NFTS_TTL_MS, {
        revalidate: "always",
        onRevalidated: () => void revalidateNftViews(),
      })
    } catch (e) {
      console.error(`ICP NFT source failed: ${key}`, e)
      return []
    }
  }

  private async withExtFloorPrices(
    tokens: IcpNftToken[],
  ): Promise<IcpNftToken[]> {
    const collections = [...new Set(tokens.map((t) => t.collectionId))]
    const floors = new Map(
      await Promise.all(
        collections.map(
          async (id) =>
            [id, await extFloorPriceService.getFloorPrice(id)] as const,
        ),
      ),
    )
    return tokens.map((t) => ({
      ...t,
      tokenFloorPriceIcp: floors.get(t.collectionId),
    }))
  }

  async getEVMNFTs(_userPrincipal: Principal): Promise<NFT[]> {
    let address: string
    try {
      address = await ethereumService.getQuickAddress()
    } catch {
      return []
    }
    return this.getEVMNFTsByAddress(address)
  }

  private async getEVMNFTsByAddress(address: string): Promise<NFT[]> {
    const services = [
      ethereumService,
      baseService,
      polygonService,
      arbitrumService,
    ]
    const settled = await Promise.allSettled(
      services.map((svc) => svc.getNFTs(address)),
    )
    const assets = settled.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    )
    const nfts = assets.map((asset) => new EvmNftImpl(asset))
    await Promise.all(nfts.map((nft) => nft.init()))
    return nfts
  }

  async getViewOnlyNFTs(
    address: string,
    addressType: "icp" | "evm" | "btc",
    page: number = 1,
    limitPerPage: number = Number.MAX_SAFE_INTEGER,
  ): Promise<PaginatedResponse<NFT>> {
    let rawData: NFT[] = []

    if (addressType === "btc")
      return {
        items: [],
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        nftsWithoutPrice: 0,
      }

    if (addressType === "icp") {
      rawData = await this.getICPNFTs(Principal.fromText(address), false)
    } else if (addressType === "evm") {
      rawData = await this.getEVMNFTsByAddress(address)
    }

    const nftsWithoutPrice = rawData.filter(
      (nft) => nft.getTokenFloorPriceUSD() === undefined || nft.getError(),
    ).length
    const totalItems = rawData.length
    const totalPages = Math.ceil(totalItems / limitPerPage)
    const startIndex = (page - 1) * limitPerPage
    const endIndex = Math.min(startIndex + limitPerPage, totalItems)
    const items = rawData
      .slice(startIndex, endIndex)
      .sort(
        (a, b) => (b.getTokenFloorPrice() ?? 0) - (a.getTokenFloorPrice() ?? 0),
      )

    return {
      items,
      currentPage: page,
      totalPages,
      totalItems,
      nftsWithoutPrice,
    }
  }

  async getNFTs(
    userPrincipal: Principal,
    page: number = 1,
    limitPerPage: number = Number.MAX_SAFE_INTEGER,
  ): Promise<PaginatedResponse<NFT>> {
    const [icpNfts, evmNfts] = await Promise.all([
      this.getICPNFTs(userPrincipal),
      this.getEVMNFTs(userPrincipal),
    ])

    const rawData = [...icpNfts, ...evmNfts]

    const nftsWithoutPrice = rawData.filter(
      (nft) => nft.getTokenFloorPriceUSD() === undefined || nft.getError(),
    ).length

    const totalItems = rawData.length
    const totalPages = Math.ceil(totalItems / limitPerPage)

    const startIndex = (page - 1) * limitPerPage
    const endIndex = Math.min(startIndex + limitPerPage, totalItems)

    const items = rawData.slice(startIndex, endIndex)

    const sortedItems = items.sort(
      (a, b) => (b.getTokenFloorPrice() ?? 0) - (a.getTokenFloorPrice() ?? 0),
    )

    return {
      items: sortedItems,
      currentPage: page,
      totalPages,
      totalItems,
      nftsWithoutPrice,
    }
  }

  async getNFTsTotalICPPrice(nfts: NFT[] | undefined) {
    if (!nfts || nfts.length === 0) return new BigNumber(0)

    return nfts
      .filter((nft) => !nft.getError())
      .map((nft) => nft.getTokenFloorPrice())
      .filter((price): price is number => price !== undefined)
      .reduce((sum, price) => sum.plus(price), new BigNumber(0))
  }

  @Cache(integrationCache, { ttl: 300 })
  async getNFTsTotalPrice(
    nfts?: NFT[],
    icp?: FT,
  ): Promise<
    | {
        value: string
        dayChangePercent?: string
        dayChange?: string
        dayChangePositive?: boolean
        value24h?: string
      }
    | undefined
  > {
    if (!nfts || nfts.length === 0) return

    await Promise.all([
      ...nfts.map((nft) =>
        nft.isInited() ? Promise.resolve(nft) : nft.init(),
      ),
      exchangeRateService.cacheUsdIcpRate(),
    ])

    const usdBalance = nfts
      .filter((nft) => !nft.getError())
      .map((nft) => BigNumber(nft.getTokenFloorPriceUSD()?.toFixed(2) ?? 0))
      .reduce((sum, usd) => sum.plus(usd), new BigNumber(0))

    if (!icp) return { value: usdBalance.toString() }

    const tokenRate = await exchangeRateService.usdPriceForICRC1(
      icp.getTokenAddress(),
    )

    if (!tokenRate) return { value: usdBalance.toString() }

    const usdBalanceDayChange = icp.getUSDBalanceDayChange(usdBalance)
    const tokenRateDayChange = icp.getTokenRateDayChangePercent()

    if (!usdBalanceDayChange) return { value: usdBalance.toString() }

    return {
      value: usdBalance.toString(),
      dayChangePercent: tokenRateDayChange?.value ?? "0.00",
      dayChange: usdBalanceDayChange.toFixed(2),
      dayChangePositive: usdBalanceDayChange.gte(0),
      value24h: usdBalance.minus(usdBalanceDayChange).toFixed(2),
    }
  }

  async getNFTByTokenId(
    id: string,
    userPrincipal: Principal,
    pages: number = 1,
    limit: number = Number.MAX_SAFE_INTEGER,
  ): Promise<NFT | undefined> {
    const nftList = await this.getNFTs(userPrincipal, 1, pages * limit)
    const nft = nftList.items.find((nft) => nft.getTokenId() === id)?.init()
    if (!nft) throw new Error("NFT not found")
    return nft
  }

  async getViewOnlyNFTByTokenId(
    id: string,
    address: string,
    addressType: "icp" | "evm" | "btc",
    pages: number = 1,
    limit: number = Number.MAX_SAFE_INTEGER,
  ): Promise<NFT | undefined> {
    const nftList = await this.getViewOnlyNFTs(
      address,
      addressType,
      1,
      pages * limit,
    )
    const nft = nftList.items.find((nft) => nft.getTokenId() === id)?.init()
    if (!nft) throw new Error("NFT not found")
    return nft
  }
}

export const nftService = new NftService()

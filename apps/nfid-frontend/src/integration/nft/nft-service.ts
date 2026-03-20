import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import { arbitrumService } from "frontend/integration/ethereum/arbitrum/arbitrum.service"
import { baseService } from "frontend/integration/ethereum/base/base.service"
import { bnbService } from "frontend/integration/ethereum/bnb/bnb.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { polygonService } from "frontend/integration/ethereum/polygon/polygon.service"
import { EvmNftImpl } from "src/integration/nft/impl/evm/nft-evm"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { nftMapper } from "src/integration/nft/impl/nft-mapper"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { NFT } from "src/integration/nft/nft"

import { exchangeRateService } from "@nfid/integration"

import type { FT } from "../ft/ft"

export class NftService {
  async getICPNFTs(userPrincipal: Principal): Promise<NFT[]> {
    const data = await nftGeekService.getNftGeekData(userPrincipal)
    const nfts = data
      .map(nftMapper.toNFT)
      .filter((nft): nft is NFT => nft !== null)
    await Promise.all(nfts.map((nft) => nft.init()))
    return nfts
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

  async getEVMNFTsByAddress(address: string): Promise<NFT[]> {
    const services = [
      ethereumService,
      baseService,
      polygonService,
      arbitrumService,
      bnbService,
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
      rawData = await this.getICPNFTs(Principal.fromText(address))
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
}

export const nftService = new NftService()

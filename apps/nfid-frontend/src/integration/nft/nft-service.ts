import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { nftMapper } from "src/integration/nft/impl/nft-mapper"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { NFT } from "src/integration/nft/nft"

import { exchangeRateService } from "@nfid/integration"

import { FT } from "../ft/ft"

export class NftService {
  async getNFTs(
    userPrincipal: Principal,
    page: number = 1,
    limitPerPage: number = Number.MAX_SAFE_INTEGER,
  ): Promise<PaginatedResponse<NFT>> {
    const data = await nftGeekService.getNftGeekData(userPrincipal)

    const rawData = data
      .map(nftMapper.toNFT)
      .filter((nft): nft is NFT => nft !== null)

    await Promise.all(rawData.map((nft) => nft.init()))

    const nftsWithoutPrice = rawData.filter(
      (nft) => nft.getTokenFloorPriceUSD() === undefined || nft.getError(),
    ).length

    const totalItems = rawData.length
    const totalPages = Math.ceil(totalItems / limitPerPage)

    const startIndex = (page - 1) * limitPerPage
    const endIndex = Math.min(startIndex + limitPerPage, totalItems)

    const items = rawData.slice(startIndex, endIndex)

    const sortedItems = items.sort(
      (a, b) =>
        Number(b.getTokenFloorPriceIcpFormatted()) -
        Number(a.getTokenFloorPriceIcpFormatted()),
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
      .map((nft) => nft.getTokenFloorPriceIcp())
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

    await Promise.all(
      nfts.map((nft) => (nft.isInited() ? Promise.resolve(nft) : nft.init())),
    )

    if (!icp) return

    const tokenRate = await exchangeRateService.usdPriceForICRC1(
      icp.getTokenAddress(),
    )

    if (!tokenRate) return

    const usdBalance = nfts
      .filter((nft) => !nft.getError())
      .map((nft) => BigNumber(nft.getTokenFloorPriceUSD() ?? 0))
      .reduce((sum, usd) => sum.plus(usd), new BigNumber(0))

    const usdBalanceDayChange = icp.getUSDBalanceDayChange(usdBalance)
    const tokenRateDayChange = icp.getTokenRateDayChangePercent()

    if (!usdBalanceDayChange) return

    return {
      value: usdBalance.toFixed(2),
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

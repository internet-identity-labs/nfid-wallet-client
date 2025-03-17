import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import {
  fetchTokens,
  getUserPrincipalId,
} from "packages/ui/src/organisms/tokens/utils"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { nftMapper } from "src/integration/nft/impl/nft-mapper"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { NFT } from "src/integration/nft/nft"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

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
    }
  }

  async getNFTsTotalPrice(userPrincipal: Principal): Promise<
    | {
        value: string
        dayChangePercent?: string
        dayChange?: string
        dayChangePositive?: boolean
      }
    | undefined
  > {
    const data = await nftGeekService.getNftGeekData(userPrincipal)
    const rawData = data
      .map(nftMapper.toNFT)
      .filter((nft): nft is NFT => nft !== null)

    const [, userPrincipalData, tokens] = await Promise.all([
      Promise.all(rawData.map((nft) => nft.init())),
      getUserPrincipalId(),
      fetchTokens(),
    ])

    const total = rawData
      .map((nft) => nft.getTokenFloorPriceUSD())
      .filter((price) => price !== undefined)
      .reduce((price: number, foolPrice: number) => price + foolPrice, 0)

    const icp = tokens.find(
      (token) => token.getTokenAddress() === ICP_CANISTER_ID,
    )

    if (!icp) return

    await icp.init(Principal.fromText(userPrincipalData.publicKey))
    const usdBalanceDayChange = icp.getUSDBalanceDayChange()

    return {
      value: total.toFixed(2),
      dayChangePercent: !total
        ? "0.00"
        : BigNumber(usdBalanceDayChange!)
            .div(total)
            .multipliedBy(100)
            .abs()
            .toFixed(2),
      dayChange: BigNumber(usdBalanceDayChange!).toFixed(2),
      dayChangePositive: usdBalanceDayChange!.gte(0),
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

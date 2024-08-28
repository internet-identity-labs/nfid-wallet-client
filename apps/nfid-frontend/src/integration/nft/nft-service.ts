import {Principal} from "@dfinity/principal"
import {nftGeekService} from "src/integration/nft/geek/nft-geek-service"
import {nftMapper} from "src/integration/nft/impl/nft-mapper"
import {PaginatedResponse} from "src/integration/nft/impl/nft-types"
import {NFT} from "src/integration/nft/nft"

export class NftService {
  async getNFTs(
    userPrincipal: Principal,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<NFT>> {
    const data = await nftGeekService.getNftGeekData(userPrincipal)

    const rawData = data
      .map(nftMapper.toNFT)
      .filter((nft): nft is NFT => nft !== null)

    const totalItems = rawData.length
    const totalPages = Math.ceil(totalItems / limit)

    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, totalItems)

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

  async getNFTsTotalPrice(
    userPrincipal: Principal
  ): Promise<number> {
    const data = await nftGeekService.getNftGeekData(userPrincipal)
    const rawData = data
      .map(nftMapper.toNFT)
      .filter((nft): nft is NFT => nft !== null)

    await Promise.all(rawData.map((nft) => nft.init()))

    return rawData.map((nft) => nft.getTokenFloorPriceUSD())
      .filter((price) => price !== undefined)
      .reduce((price: number, foolPrice: number) => price + foolPrice, 0)
  }
}

export const nftService = new NftService()

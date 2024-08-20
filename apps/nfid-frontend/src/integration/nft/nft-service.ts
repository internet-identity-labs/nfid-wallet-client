import { Principal } from "@dfinity/principal"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { nftMapper } from "src/integration/nft/impl/nft-mapper"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { NFT } from "src/integration/nft/nft"

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

    const initedItems = await Promise.all(items.map(async (nft) => nft.init()))

    const sortedItems = initedItems.sort(
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

  async getNFTById(
    id: string,
    userPrincipal: Principal,
  ): Promise<NFT | undefined> {
    const nftList = await this.getNFTs(userPrincipal)
    const nft = nftList.items.find((nft) => nft.getTokenId() === id)
    if (!nft) throw new Error("NFT not found")
    return nft
  }
}

export const nftService = new NftService()

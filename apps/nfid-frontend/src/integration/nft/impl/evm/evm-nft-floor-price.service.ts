import { ttlCacheService } from "@nfid/client-db"
import { ALCHEMY_CHAIN_MAP } from "../../constants/constants"

export interface EvmNftFloorPrice {
  nativePrice: number
  usdPrice: number
  symbol: string
}

export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY as string
const FLOOR_PRICE_CACHE_TTL = 5 * 60 * 1000

class EvmNftFloorPriceService {
  async getFloorPrice(
    contract: string,
    chainId: number,
  ): Promise<EvmNftFloorPrice | undefined> {
    const network = ALCHEMY_CHAIN_MAP[chainId]
    if (!network) return undefined

    const cacheKey = `EVM_NFT_FLOOR_${chainId}_${contract.toLowerCase()}`

    const result = await ttlCacheService.getOrFetch(
      cacheKey,
      () => this.fetchFloorPrice(contract, network),
      FLOOR_PRICE_CACHE_TTL,
      {
        serialize: (v) => JSON.stringify(v),
        deserialize: (v) => JSON.parse(v as string) as EvmNftFloorPrice | null,
      },
    )
    return result ?? undefined
  }

  private async fetchFloorPrice(
    contract: string,
    network: string,
  ): Promise<EvmNftFloorPrice | null> {
    try {
      const url = new URL(
        `https://${network}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getFloorPrice`,
      )
      url.searchParams.set("contractAddress", contract)

      const response = await fetch(url.toString())
      if (!response.ok) return null

      const data = await response.json()
      const marketplace =
        data.openSea ?? data.looksRare ?? data.blur ?? data.x2y2

      if (!marketplace?.floorPrice) return null

      return {
        nativePrice: Number(marketplace.floorPrice),
        usdPrice: Number(marketplace.floorPriceUsd ?? 0),
        symbol: marketplace.priceCurrency ?? "ETH",
      }
    } catch (e) {
      console.error("Alchemy floor price fetch failed:", e)
      return null
    }
  }
}

export const evmNftFloorPriceService = new EvmNftFloorPriceService()

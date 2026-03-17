import { ttlCacheService } from "@nfid/client-db"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export interface EvmNftFloorPrice {
  nativePrice: number
  usdPrice: number
  symbol: string
}

const MORALIS_CHAIN_MAP: Partial<Record<number, string>> = {
  [ChainId.ETH]: "eth",
  [ChainId.BASE]: "base",
  [ChainId.POL]: "polygon",
  [ChainId.ARB]: "arbitrum",
  [ChainId.BNB]: "bsc",
}

export const MORALIS_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjFmYTAyMDM4LTg4YWQtNGY2Mi1hYjIzLTAzMTFmODk0MTMzOCIsIm9yZ0lkIjoiNTA1MDAzIiwidXNlcklkIjoiNTE5NjIyIiwidHlwZUlkIjoiNjFhNTNmOTYtZmY1Yy00ZTVjLWI2NTQtN2ZiNzYyOTg4ZjU0IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzMzMTg4MzYsImV4cCI6NDkyOTA3ODgzNn0.zGkAm3Jq5bwPjvg-WKZDb-wxszOISCTuqDos14juBaY"
const FLOOR_PRICE_CACHE_TTL = 5 * 60 * 1000

class EvmNftFloorPriceService {
  async getFloorPrice(
    contract: string,
    chainId: number,
  ): Promise<EvmNftFloorPrice | undefined> {
    const baseUrl = MORALIS_CHAIN_MAP[chainId]
    if (!baseUrl) return undefined

    const cacheKey = `EVM_NFT_FLOOR_${chainId}_${contract.toLowerCase()}`

    return ttlCacheService.getOrFetch(
      cacheKey,
      () => this.fetchFloorPrice(contract, baseUrl),
      FLOOR_PRICE_CACHE_TTL,
      {
        serialize: JSON.stringify,
        deserialize: (v) => JSON.parse(v as string) as EvmNftFloorPrice,
      },
    )
  }

  private async fetchFloorPrice(
    contract: string,
    baseUrl: string,
  ): Promise<EvmNftFloorPrice | undefined> {
    const url = new URL(
      `https://deep-index.moralis.io/api/v2.2/nft/${contract}/floor-price`,
    )
    url.searchParams.set("chain", baseUrl)

    const response = await fetch(url.toString(), {
      headers: { "X-API-Key": MORALIS_API_KEY },
    })

    if (!response.ok) return undefined

    const data = await response.json()

    if (!data.floor_price) return undefined

    return {
      nativePrice: Number(data.floor_price),
      usdPrice: Number(data.floor_price_usd ?? 0),
      symbol: data.floor_price_currency ?? "ETH",
    }
  }
}

export const evmNftFloorPriceService = new EvmNftFloorPriceService()

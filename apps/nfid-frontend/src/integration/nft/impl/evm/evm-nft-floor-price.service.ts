import { ttlCacheService } from "@nfid/client-db"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export interface EvmNftFloorPrice {
  nativePrice: number
  usdPrice: number
  symbol: string
}

const RESERVOIR_BASE_URLS: Partial<Record<number, string>> = {
  [ChainId.ETH]: "https://api.reservoir.tools",
  [ChainId.BASE]: "https://api-base.reservoir.tools",
  [ChainId.POL]: "https://api-polygon.reservoir.tools",
  [ChainId.ARB]: "https://api-arbitrum.reservoir.tools",
  [ChainId.BNB]: "https://api-bsc.reservoir.tools",
}

const RESERVOIR_API_KEY = "demo-api-key"
const FLOOR_PRICE_CACHE_TTL = 5 * 60 * 1000

class EvmNftFloorPriceService {
  async getFloorPrice(
    contract: string,
    chainId: number,
  ): Promise<EvmNftFloorPrice | undefined> {
    const baseUrl = RESERVOIR_BASE_URLS[chainId]
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
    const url = new URL(`${baseUrl}/collections/v7`)
    url.searchParams.set("contract", contract)
    url.searchParams.set("limit", "1")

    const response = await fetch(url.toString(), {
      headers: { "x-api-key": RESERVOIR_API_KEY },
    })

    if (!response.ok) return undefined

    const data = await response.json()
    const price = data.collections?.[0]?.floorAsk?.price

    if (!price?.amount?.decimal) return undefined

    return {
      nativePrice: price.amount.decimal,
      usdPrice: price.amount.usd ?? 0,
      symbol: price.currency?.symbol ?? "ETH",
    }
  }
}

export const evmNftFloorPriceService = new EvmNftFloorPriceService()

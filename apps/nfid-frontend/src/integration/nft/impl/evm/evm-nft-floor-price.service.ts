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

const MORALIS_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImYzYTJiZDUyLWJhY2QtNDhmMi1iZDU5LWIyNTM2ZDUxZjc3ZSIsIm9yZ0lkIjoiNTA0ODczIiwidXNlcklkIjoiNTE5NDkxIiwidHlwZUlkIjoiZTk5ODMxNGItMzZiYi00MTEzLTlhMjgtZWUwMmM2YWE5ZGU0IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzMyMzU4MTYsImV4cCI6NDkyODk5NTgxNn0.jlaTZDOiVwdRjVLBnrXg_W6y_4702t89qS0ec-92_Kg"
const FLOOR_PRICE_CACHE_TTL = 5 * 60 * 1000

class EvmNftFloorPriceService {
  async getFloorPrice(
    contract: string,
    chainId: number,
  ): Promise<EvmNftFloorPrice | undefined> {
    const chain = MORALIS_CHAIN_MAP[chainId]
    if (!chain) return undefined

    const cacheKey = `EVM_NFT_FLOOR_${chainId}_${contract.toLowerCase()}`

    return ttlCacheService.getOrFetch(
      cacheKey,
      () => this.fetchFloorPrice(contract, chain),
      FLOOR_PRICE_CACHE_TTL,
      {
        serialize: JSON.stringify,
        deserialize: (v) => JSON.parse(v as string) as EvmNftFloorPrice,
      },
    )
  }

  private async fetchFloorPrice(
    contract: string,
    chain: string,
  ): Promise<EvmNftFloorPrice | undefined> {
    const url = new URL(
      `https://deep-index.moralis.io/api/v2.2/nft/${contract}/floor-price`,
    )
    url.searchParams.set("chain", chain)

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

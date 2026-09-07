import { ttlCacheService } from "@nfid/client-db"
import { exchangeRateService } from "@nfid/integration"
import {
  CKETH_LEDGER_CANISTER_ID,
  POLYGON_ADDRESS,
} from "@nfid/integration/token/constants"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { polygonErc20Service } from "frontend/integration/ethereum/polygon/pol-erc20.service"
import { ALCHEMY_CHAIN_MAP } from "../../constants/constants"

export const EVM_NFT_FLOOR_PRICE_CACHE_NAME = "EVM_NFT_FLOOR_"

export interface EvmNftFloorPrice {
  nativePrice: number
  usdPrice: number
  symbol: string
}

const FLOOR_PRICE_CACHE_TTL = 5 * 60 * 1000

class EvmNftFloorPriceService {
  async getFloorPrice(
    contract: string,
    chainId: number,
  ): Promise<EvmNftFloorPrice | undefined> {
    const network = ALCHEMY_CHAIN_MAP[chainId]
    if (!network) return undefined

    const cacheKey = `${EVM_NFT_FLOOR_PRICE_CACHE_NAME}${chainId}_${contract.toLowerCase()}`

    const result = await ttlCacheService.getOrFetch(
      cacheKey,
      () => this.fetchFloorPrice(contract, network, chainId),
      FLOOR_PRICE_CACHE_TTL,
      {
        serialize: (v) => JSON.stringify(v),
        deserialize: (v) => JSON.parse(v as string) as EvmNftFloorPrice | null,
      },
    )
    return result ?? undefined
  }

  private async getNativeUsdRate(chainId: number): Promise<number> {
    if (chainId === ChainId.POL) {
      const prices = await polygonErc20Service.getUSDPrices([POLYGON_ADDRESS])
      return prices.length > 0 ? prices[0].price : 0
    }
    const rate = await exchangeRateService.usdPriceForICRC1(
      CKETH_LEDGER_CANISTER_ID,
    )
    return rate?.value?.toNumber() ?? 0
  }

  private async fetchFloorPrice(
    contract: string,
    network: string,
    chainId: number,
  ): Promise<EvmNftFloorPrice | null> {
    try {
      const url = new URL(
        `https://${network}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getFloorPrice`,
      )
      url.searchParams.set("contractAddress", contract)

      const [response, nativeUsdRate] = await Promise.all([
        fetch(url.toString()),
        this.getNativeUsdRate(chainId),
      ])

      if (!response.ok) return null

      const data = await response.json()
      const marketplace =
        data.openSea ?? data.looksRare ?? data.blur ?? data.x2y2

      if (!marketplace?.floorPrice) return null

      const nativePrice = Number(marketplace.floorPrice)

      return {
        nativePrice,
        usdPrice: nativeUsdRate * nativePrice,
        symbol: marketplace.priceCurrency ?? "ETH",
      }
    } catch (e) {
      console.error("Alchemy floor price fetch failed:", e)
      return null
    }
  }
}

export const evmNftFloorPriceService = new EvmNftFloorPriceService()

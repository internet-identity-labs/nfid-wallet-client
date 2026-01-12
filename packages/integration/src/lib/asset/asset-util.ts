import { Cache } from "node-ts-cache"

import { integrationCache } from "../../cache"
import { TokenPrice } from "./types"
import { wrappedTokenMap } from "./wrapped-token-map"

const NOT_AVAILABLE = ""

export class PriceService {
  public async getPrice(tokens: string[]): Promise<TokenPrice[]> {
    const prices = await this.fetchPrices()

    const result = tokens.map((token) => {
      token = PriceService.unwrapICRC1ckToken(token)
      const priceInToken = prices[token]
      const priceInUsd = priceInToken
        ? (1 / priceInToken).toFixed(2)
        : NOT_AVAILABLE
      return { token, price: +priceInUsd }
    })

    return result
  }

  public async getPriceFull(): Promise<TokenPrice[]> {
    const prices = await this.fetchPrices()
    Object.keys(wrappedTokenMap).forEach((wrappedToken) => {
      const baseToken = wrappedTokenMap[wrappedToken]
      if (prices[baseToken]) prices[wrappedToken] = prices[baseToken]
    })
    return prices
  }

  @Cache(integrationCache, { ttl: 10 })
  public async fetchPrices() {
    return fetch(AWS_EXCHANGE_RATE)
      .then(async (response) => {
        if (!response.ok) {
          throw []
        }
        return response.json().then((x) => x.data.rates)
      })
      .catch((e) => {
        return []
      })
  }

  public static unwrapICRC1ckToken(token: string): string {
    return wrappedTokenMap[token] || token
  }
}

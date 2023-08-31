import { TokenPrice } from "./types"
import { integrationCache } from "../../cache"
import { Cache } from "node-ts-cache"

const NOT_AVAILABLE = ""

export class PriceService {

  public async getPrice(tokens: string[]): Promise<TokenPrice[]> {
    const prices = await this.fetchPrices()

    const result = tokens.map((token) => {
      const priceInToken = prices[token]
      const priceInUsd = priceInToken
        ? (1 / priceInToken).toFixed(2)
        : NOT_AVAILABLE
      return { token, price: priceInUsd }
    })

    return result
  }

  public async getPriceFull(): Promise<TokenPrice[]> {
    return this.fetchPrices()
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

}

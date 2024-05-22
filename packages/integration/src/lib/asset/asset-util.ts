import { Cache } from "node-ts-cache"

import { integrationCache } from "../../cache"
import { TokenPrice } from "./types"

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
      return { token, price: priceInUsd }
    })

    return result
  }

  public async getPriceFull(): Promise<TokenPrice[]> {
    let prices = await this.fetchPrices()
    const btcPrice = prices["BTC"]
    const ethPrice = prices["ETH"]
    if (btcPrice) {
      prices["ckBTC"] = btcPrice
    }
    if (ethPrice) {
      prices["ckETH"] = ethPrice
    }
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
    return token === "ckBTC" ? "BTC" : token === "ckETH" ? "ETH" : token
  }
}

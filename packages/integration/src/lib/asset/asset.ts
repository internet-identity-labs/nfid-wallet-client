import { TokenPrice } from "./types"

const COINBASE_RATES_URL = `https://api.coinbase.com/v2/exchange-rates`
const NOT_AVAILABLE = "N/A"

export const getPrice = async (tokens: string[]): Promise<TokenPrice[]> => {
  const prices = await fetch(COINBASE_RATES_URL).then(async (response) => {
    if (!response.ok) {
      throw []
    }
    return response.json().then((x) => x.data.rates)
  })

  const result = tokens.map((token) => {
    const priceInToken = prices[token]
    const priceInUsd = priceInToken
      ? (1 / priceInToken).toFixed(2)
      : NOT_AVAILABLE
    return { token, price: priceInUsd }
  })

  return result
}

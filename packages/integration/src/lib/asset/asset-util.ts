import { TokenPrice } from "./types"

const COINBASE_RATES_URL = `https://tt4jxkw8vg.execute-api.us-east-1.amazonaws.com/staging/exchange-rate`
const NOT_AVAILABLE = ""

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

export const getPriceFull = async (): Promise<TokenPrice[]> => {
  return fetch(COINBASE_RATES_URL).then(async (response) => {
    if (!response.ok) {
      throw []
    }
    return response.json().then((x) => x.data.rates)
  })
}

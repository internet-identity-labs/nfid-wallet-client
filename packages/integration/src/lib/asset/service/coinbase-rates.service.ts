import { PriceService } from "../asset-util"

const chainNames: Record<number, string> = {
  1: "ETH",
  5: "ETH",
  137: "MATIC",
  80001: "MATIC",
}

export const coinbaseRatesService = {
  getRateByChainId: async (chainId: number): Promise<number | undefined> => {
    const chainName = chainNames[chainId]

    if (!chainName) {
      throw Error("The Chain is not supported.")
    }

    const tokenPrice = await new PriceService()
      .getPrice([chainName])
      .then((tokenPrices) => parseFloat(tokenPrices[0].price.toString()))

    return tokenPrice
  },
}

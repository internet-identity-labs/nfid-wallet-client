const chainConfigs: Record<
  string,
  { symbol: string; currency: string; chainName: string }
> = {
  "0x01": { symbol: "ETH", currency: "ETH", chainName: "Ethereum" },
  "0x89": { symbol: "ETH", currency: "MATIC", chainName: "Polygon" },
  "0x013881": {
    symbol: "Mumbai ETH",
    currency: "MATIC",
    chainName: "Mumbai Polygon",
  },
}

export const chainService = {
  getSymbolAndChainName: function (chainId?: string): {
    symbol: string
    currency: string
    chainName: string
  } {
    if (!chainId) throw Error("The chainId has not been provided.")

    return chainConfigs[chainId]
  },
}

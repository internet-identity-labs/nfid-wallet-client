const chainConfigs: Record<string, { symbol: string; chainName: string }> = {
  "0x01": { symbol: "ETH", chainName: "Ethereum" },
  "0x05": { symbol: "ETH", chainName: "Goerli" },
  "0x89": { symbol: "MATIC", chainName: "Polygon" },
  "0x013881": { symbol: "MATIC", chainName: "Mumbai Polygon" },
}

export const chainService = {
  getSymbolAndChainName: function (chainId?: string): {
    symbol: string
    chainName: string
  } {
    if (!chainId) return { symbol: "", chainName: "" }

    return chainConfigs[chainId]
  },
}

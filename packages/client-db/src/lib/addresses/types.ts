export type NetworkKey = "BTC" | "ETH"

export type CachedAddresses = {
  [scope: string]: {
    [network: string]: string
  }
}

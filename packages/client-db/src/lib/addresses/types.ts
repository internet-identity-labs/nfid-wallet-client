export enum NetworkKey {
  BTC = "BTC",
  EVM = "EVM",
}

export type CachedAddresses = {
  [scope: string]: {
    [network: string]: string
  }
}

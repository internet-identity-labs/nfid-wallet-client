export enum Category {
  Sns = "Sns",
  Known = "Known",
  Native = "Native",
  Spam = "Spam",
  ChainFusionTestnet = "ChainFusionTestnet",
  ChainFusion = "ChainFusion",
  Community = "Community",
  ERC20 = "ERC20",
}

export enum State {
  Active = "Active",
  Inactive = "Inactive",
}

export enum ChainId {
  BTC = -1,
  ETH = 1,
  ICP = 0,
  POL = 137,
  BNB = 56,
  BASE = 8453,
  ARB = 42161,
}

export const isEvmNativeToken = (chainId: ChainId): boolean => {
  return (
    chainId === ChainId.ETH ||
    chainId === ChainId.POL ||
    chainId === ChainId.BNB ||
    chainId === ChainId.BASE ||
    chainId === ChainId.ARB
  )
}

export const isNonIcrc1Token = (chainId: ChainId): boolean => {
  return (
    chainId === ChainId.BTC ||
    chainId === ChainId.ETH ||
    chainId === ChainId.POL ||
    chainId === ChainId.BNB ||
    chainId === ChainId.BASE ||
    chainId === ChainId.ARB
  )
}

export const CHAIN_NAME: Record<ChainId, string> = {
  [ChainId.BTC]: "Bitcoin",
  [ChainId.ETH]: "Ethereum",
  [ChainId.ICP]: "Internet Computer",
  [ChainId.POL]: "Polygon",
  [ChainId.BNB]: "BNB Smart Chain",
  [ChainId.BASE]: "Base",
  [ChainId.ARB]: "Arbitrum One",
}

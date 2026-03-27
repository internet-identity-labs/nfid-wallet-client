import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export const e8s = 100000000

export const ALCHEMY_CHAIN_MAP: Partial<Record<number, string>> = {
  [ChainId.ETH]: "eth-mainnet",
  [ChainId.BASE]: "base-mainnet",
  [ChainId.POL]: "polygon-mainnet",
  [ChainId.ARB]: "arb-mainnet",
}

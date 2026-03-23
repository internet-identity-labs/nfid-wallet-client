import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export const e8s = 100000000

export const MORALIS_CHAIN_MAP: Partial<Record<number, string>> = {
  [ChainId.ETH]: "eth",
  [ChainId.BASE]: "base",
  [ChainId.POL]: "polygon",
  [ChainId.ARB]: "arbitrum",
}

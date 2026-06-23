import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { AaveSupportedChainId } from "./types"

export const AAVE_REFERRAL_CODE = 0

export const AAVE_SUPPORTED_CHAINS: AaveSupportedChainId[] = [
  ChainId.ETH,
  ChainId.POL,
  ChainId.ARB,
  ChainId.BASE,
]

export const AAVE_V3_POOL: Record<number, string> = {
  [ChainId.ETH]: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  [ChainId.POL]: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  [ChainId.ARB]: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  [ChainId.BASE]: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
}

export const WETH_GATEWAY: Record<number, string> = {
  [ChainId.ETH]: "0x893411580e590D62dDBca8a703d61Cc4A8c7b2b9",
  [ChainId.POL]: "0xC1E320966c485ebF2A0A2A6d3c0Dc860A156eB1B",
  [ChainId.ARB]: "0xB5Ee21786D28c5Ba61661550879475976B707099",
  [ChainId.BASE]: "0x729b3EA8C005AbC58c9150fb57Ec161296F06766",
}

export const WRAPPED_NATIVE_TOKEN: Record<number, string> = {
  [ChainId.ETH]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [ChainId.POL]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  [ChainId.ARB]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [ChainId.BASE]: "0x4200000000000000000000000000000000000006",
}

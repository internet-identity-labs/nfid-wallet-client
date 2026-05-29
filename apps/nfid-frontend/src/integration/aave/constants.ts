import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

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
  [ChainId.BASE]: "0x8be473dCfA93132559B118a2e1DA2E42D0B8d18B",
}

export const AAVE_REFERRAL_CODE = 0

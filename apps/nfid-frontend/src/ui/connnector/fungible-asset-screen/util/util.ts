import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { stringICPtoE8s } from "src/integration/wallet/utils"
import { TokenConfig } from "src/ui/connnector/types"

import { toPresentation } from "@nfid/integration/token/icp"

export function nativeToTokenConfig(
  config: any,
  tokenSheet: TokenBalanceSheet,
): TokenConfig {
  return {
    icon: config.icon,
    tokenStandard: config.tokenStandard,
    title: config.title,
    currency: config.currency,
    balance: tokenSheet?.tokenBalance,
    price: tokenSheet?.usdBalance,
    fee: BigInt(tokenSheet?.fee ?? 0),
    toPresentation,
    transformAmount: stringICPtoE8s,
    blockchain: config.blockchain,
  }
}
export function erc20ToTokenConfig(
  config: any,
  tokenSheet: TokenBalanceSheet,
): TokenConfig {
  return {
    tokenStandard: config.tokenStandard,
    icon: tokenSheet.icon,
    title: tokenSheet.label,
    currency: tokenSheet.token,
    balance: tokenSheet.tokenBalance,
    price: tokenSheet.usdBalance,
    blockchain: config.blockchain,
    fee: BigInt(0),
    toPresentation,
    transformAmount: stringICPtoE8s,
    feeCurrency: config.feeCurrency,
    contract: tokenSheet.contract,
  }
}

import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { stringICPtoE8s } from "src/integration/wallet/utils"
import {
  AssetErc20Config,
  AssetNativeConfig,
  TokenConfig,
} from "src/ui/connnector/types"

import { toPresentation } from "@nfid/integration/token/icp"

export function toNativeTokenConfig(
  config: AssetNativeConfig,
  tokenSheet: TokenBalanceSheet,
): TokenConfig {
  return {
    icon: config.icon,
    tokenStandard: config.tokenStandard,
    title: tokenSheet.label,
    currency: config.feeCurrency,
    balance: tokenSheet?.tokenBalance,
    price: tokenSheet?.usdBalance,
    fee: BigInt(tokenSheet?.fee ?? 0),
    toPresentation,
    transformAmount: stringICPtoE8s,
    blockchain: config.blockchain,
  }
}

export function erc20ToTokenConfig(
  config: AssetErc20Config,
  tokenSheet: TokenBalanceSheet,
): TokenConfig {
  return {
    tokenStandard: config.tokenStandard,
    icon: tokenSheet.icon,
    title: `${tokenSheet.label} ${config.network ? `${config.network}` : ""}`,
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

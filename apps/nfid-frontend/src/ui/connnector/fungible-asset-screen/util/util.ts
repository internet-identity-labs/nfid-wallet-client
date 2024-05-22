import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { stringICPtoE8s } from "src/integration/wallet/utils"
import {
  AssetErc20Config,
  AssetNativeConfig,
  TokenConfig,
} from "src/ui/connnector/types"

import { NetworkKey, storeAddressInLocalCache } from "@nfid/client-db"
import { toPresentation } from "@nfid/integration/token/icp"

export function toNativeTokenConfig(
  config: AssetNativeConfig,
  tokenSheet: TokenBalanceSheet,
  networkKey: NetworkKey,
  anchor: bigint,
): TokenConfig {
  storeAddressInLocalCache({
    address: tokenSheet.address,
    accountId: "-1",
    hostname: "nfid.one",
    anchor,
    network: networkKey,
  })

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
    canisterId: "",
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
    canisterId: "",
  }
}

export const getTokenConfigKey = (config: TokenConfig): string => {
  return `${config.currency}&${config.tokenStandard}&${config.blockchain}`
}

// Utility function to merge the fetched token config with the current configurations
export const mergeSingleTokenConfig = (
  currentConfigs: TokenConfig[],
  newConfig: TokenConfig,
): TokenConfig[] => {
  const key = getTokenConfigKey(newConfig)
  const existingConfig = currentConfigs.find(
    (config) => getTokenConfigKey(config) === key,
  )

  if (existingConfig) {
    // If the token config already exists, overwrite the balance
    return currentConfigs.map((config) =>
      getTokenConfigKey(config) === key
        ? { ...config, balance: newConfig.balance }
        : config,
    )
  }

  // Otherwise, return the current configs with the new config appended
  return [...currentConfigs, newConfig]
}

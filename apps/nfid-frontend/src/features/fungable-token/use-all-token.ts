import React from "react"
import { fungibleAssetFactory } from "src/ui/connnector/fungible-asset-screen/fungible-asset-factory"
import { useTokenConfig } from "src/ui/connnector/fungible-asset-screen/hooks/use-token-config"
import { useICTokens } from "src/ui/connnector/fungible-asset-screen/ic/hooks/use-icp"
import { AssetFilter, TokenConfig } from "src/ui/connnector/types"

export const useAllToken = (
  assetFilters: AssetFilter[] = [],
): { token: TokenConfig[]; isLoading: boolean } => {
  const tokens = fungibleAssetFactory.getKeys()
  const { configs: tokenConfigs, isLoading } = useTokenConfig({ tokens })

  const { configs: icTokenConfigs, isLoading: isICLoading } =
    useICTokens(assetFilters)

  const token: TokenConfig[] = React.useMemo(() => {
    if (assetFilters.length && !assetFilters.find((f) => f.accountId === "-1"))
      return isICLoading ? [] : icTokenConfigs

    const allTokens = isICLoading
      ? tokenConfigs
      : [...tokenConfigs, ...icTokenConfigs]

    return allTokens.sort((a, b) => a.currency.localeCompare(b.currency))
  }, [assetFilters, icTokenConfigs, isICLoading, tokenConfigs])

  console.debug("useAllToken", { tokenConfigs, icTokenConfigs, tokens, token })

  return { token, isLoading }
}

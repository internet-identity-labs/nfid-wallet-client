import React from "react"
import { fungibleAssetFactory } from "src/ui/connnector/fungible-asset-screen/fungible-asset-factory"
import { useTokenConfig } from "src/ui/connnector/fungible-asset-screen/hooks/use-token-config"
import { useICTokens } from "src/ui/connnector/fungible-asset-screen/ic/hooks/use-icp"
import { AssetFilter, TokenConfig } from "src/ui/connnector/types"

export const useAllToken = (
  assetFilters: AssetFilter[] = [],
): { token: TokenConfig[] } => {
  const tokens = fungibleAssetFactory.getKeys()
  const { configs: tokenConfigs } = useTokenConfig({ tokens, assetFilters })

  const icTokenConfigs = useICTokens(assetFilters)

  const token: TokenConfig[] = React.useMemo(() => {
    return [...tokenConfigs, ...icTokenConfigs]
  }, [tokenConfigs, icTokenConfigs])

  console.debug("useAllToken", { token })
  return { token }
}

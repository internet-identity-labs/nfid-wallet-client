import React from "react"
import { getAssetScreenTokens } from "src/ui/connnector/fungible-asset-screen/fungible-asset-factory"
import { useTokenConfig } from "src/ui/connnector/fungible-asset-screen/hooks/use-token-config"
import { useICTokens } from "src/ui/connnector/fungible-asset-screen/ic/hooks/use-icp"
import { AssetFilter, TokenConfig } from "src/ui/connnector/types"

export const useAllToken = (
  assetFilters: AssetFilter[] = [],
): { token: TokenConfig[] } => {
  const tokens = getAssetScreenTokens()
  const { configs } = useTokenConfig({ tokens, assetFilters })

  const tokenConfigs = configs.flatMap((config) => config ?? [])

  const icTokenConfigs = useICTokens(assetFilters)

  const token: TokenConfig[] = React.useMemo(() => {
    return [...tokenConfigs, ...icTokenConfigs]
  }, [tokenConfigs, icTokenConfigs])

  console.debug("useAllToken", { token })
  return { token }
}

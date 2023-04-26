import React from "react"
import { getAssetScreenTokens } from "src/ui/view-model/fungible-asset-screen/fungible-asset-factory"
import { useTokenConfig } from "src/ui/view-model/fungible-asset-screen/hooks/use-token-config"
import { useICTokens } from "src/ui/view-model/fungible-asset-screen/ic/hooks/use-icp"
import { TokenConfig } from "src/ui/view-model/types"

export const useAllToken = (): { token: TokenConfig[] } => {
  const tokens = getAssetScreenTokens()
  let configs = tokens.map(useTokenConfig)
  let tokenConfigs = configs.flatMap((config) => config.configs ?? [])
  //¯\_(ツ)_/¯
  let icTokenConfigs = useICTokens()
  const token: TokenConfig[] = React.useMemo(() => {
    return [...tokenConfigs, ...icTokenConfigs]
  }, [tokenConfigs, icTokenConfigs])
  console.debug("useAllToken", { token })
  return { token }
}

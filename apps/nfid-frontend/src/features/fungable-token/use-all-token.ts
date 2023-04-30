import React from "react"
import { getAssetScreenTokens } from "src/ui/connnector/fungible-asset-screen/fungible-asset-factory"
import { useTokenConfig } from "src/ui/connnector/fungible-asset-screen/hooks/use-token-config"
import { useICTokens } from "src/ui/connnector/fungible-asset-screen/ic/hooks/use-icp"
import { TokenConfig } from "src/ui/connnector/types"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { useWalletDelegation } from "frontend/integration/wallet/hooks/use-wallet-delegation"

export const useAllToken = (
  accountsFilter: string[] = [],
): { token: TokenConfig[] } => {
  const { profile } = useProfile()
  const { data: delegation } = useWalletDelegation(
    profile?.anchor,
    "nfid.one",
    "0",
  )
  const tokens = getAssetScreenTokens()
  const configs = tokens.map(useTokenConfig)
  const tokenConfigs = configs.flatMap((config) => config.configs ?? [])
  //¯\_(ツ)_/¯
  const icTokenConfigs = useICTokens(accountsFilter)

  const token: TokenConfig[] = React.useMemo(() => {
    if (
      !accountsFilter.length ||
      accountsFilter?.includes(delegation?.getPrincipal().toString() ?? "")
    )
      return [...tokenConfigs, ...icTokenConfigs]
    else return icTokenConfigs
  }, [accountsFilter, delegation, tokenConfigs, icTokenConfigs])

  console.debug("useAllToken", { token })

  return { token }
}

import { getTokens } from "src/ui/connnector/fungible-asset-screen/fungible-asset-factory"
import useSWR from "swr"

import { TokenStandards } from "@nfid/integration/token/types"

import { AssetFilter } from "../../types"

export const useTokenConfig = (
  asset: TokenStandards,
  assetFilters: AssetFilter[] = [],
) => {
  const { data: configs, ...rest } = useSWR(
    asset + assetFilters + "tokenConfig",
    () => getTokens(asset, assetFilters),
  )

  return { configs, ...rest }
}

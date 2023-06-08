import { fungibleAssetFactory } from "src/ui/connnector/fungible-asset-screen/fungible-asset-factory"
import useSWR from "swr"

import { AssetFilter } from "../../types"

type UseTokenConfig = {
  assetFilters: AssetFilter[]
  tokens: string[]
}

export const useTokenConfig = ({ assetFilters, tokens }: UseTokenConfig) => {
  const { data: configs, ...rest } = useSWR(
    [tokens, assetFilters, "tokenConfig"],
    ([tokens, assetFilters]) =>
      Promise.all(
        tokens.map(async (token) => {
          try {
            return await fungibleAssetFactory.getTokenConfigs(
              token,
              assetFilters,
            )
          } catch (e) {
            // FIXME: handle case when request fails
            console.error("useTokenConfig", e)
            return []
          }
        }),
      ),
  )

  return { configs: configs?.flat() || [], ...rest }
}

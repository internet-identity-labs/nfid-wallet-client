import { getTokens } from "src/ui/connnector/fungible-asset-screen/fungible-asset-factory"
import useSWR from "swr"

import { ONE_MINUTE_IN_MS } from "@nfid/config"
import { TokenStandards } from "@nfid/integration/token/types"

import { AssetFilter } from "../../types"

type UseTokenConfig = {
  assetFilters: AssetFilter[]
  tokens: TokenStandards[]
}

export const useTokenConfig = ({ assetFilters, tokens }: UseTokenConfig) => {
  const { data: configs, ...rest } = useSWR(
    [tokens, assetFilters, "tokenConfig"],
    ([tokens, assetFilters]) =>
      Promise.all(
        tokens.map(async (token) => await getTokens(token, assetFilters)),
      ),
    {
      focusThrottleInterval: ONE_MINUTE_IN_MS,
      dedupingInterval: ONE_MINUTE_IN_MS,
    },
  )

  return { configs: configs || [], ...rest }
}

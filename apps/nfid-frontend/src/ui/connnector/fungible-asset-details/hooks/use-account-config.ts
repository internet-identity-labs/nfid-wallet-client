import { getAssetDetails } from "src/ui/connnector/fungible-asset-details/fungible-asset-details-factory"
import useSWR from "swr"

import { ONE_MINUTE_IN_MS } from "@nfid/config"
import { TokenStandards } from "@nfid/integration/token/types"

type UseAssetDetails = {
  tokens: TokenStandards[]
}

export const useAssetDetails = ({ tokens }: UseAssetDetails) => {
  const { data: assets, ...rest } = useSWR(
    [tokens, "assetDetails"],
    ([tokens]) =>
      Promise.all(tokens.map(async (token) => await getAssetDetails(token))),
    {
      focusThrottleInterval: ONE_MINUTE_IN_MS,
      dedupingInterval: ONE_MINUTE_IN_MS,
    },
  )
  return { assets: assets?.flat() || [], ...rest }
}

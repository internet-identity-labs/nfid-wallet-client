import { fungibleAssetDetailsFactory } from "src/ui/connnector/fungible-asset-details/fungible-asset-details-factory"
import useSWR from "swr"

import { TokenStandards } from "@nfid/integration/token/types"

type UseAssetDetails = {
  tokens: TokenStandards[]
}

export const useAssetDetails = ({ tokens }: UseAssetDetails) => {
  const { data: assets, ...rest } = useSWR(
    [tokens, "assetDetails"],
    ([tokens]) =>
      Promise.all(
        tokens.map(async (token) => {
          try {
            return await fungibleAssetDetailsFactory.getAssetDetails(token)
          } catch (e) {
            // FIXME: handle case when request fails
            console.error("useAssetDetails", e)
            return []
          }
        }),
      ),
  )
  return { assets: assets?.flat() || [], ...rest }
}

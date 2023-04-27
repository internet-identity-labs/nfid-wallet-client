import { getAssetDetails } from "src/ui/connnector/fungible-asset-details/fungible-asset-details-factory"
import useSWR from "swr"

import { TokenStandards } from "@nfid/integration/token/types"

export const useAssetDetails = (asset: TokenStandards) => {
  const { data: assets, ...rest } = useSWR(asset + "accountConfig", () =>
    getAssetDetails(asset),
  )
  return { assets, ...rest }
}

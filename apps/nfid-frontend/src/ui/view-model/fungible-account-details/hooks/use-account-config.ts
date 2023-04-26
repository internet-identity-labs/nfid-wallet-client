import { getAssetDetails } from "src/ui/view-model/fungible-account-details/fungible-asset-details-factory"
import useSWR from "swr"

import { TokenStandards } from "@nfid/integration/token/types"

export const useAssetDetails = (asset: TokenStandards) => {
  const { data: assets, ...rest } = useSWR(asset + "accountConfig", () =>
    getAssetDetails(asset),
  )
  return { assets, ...rest }
}

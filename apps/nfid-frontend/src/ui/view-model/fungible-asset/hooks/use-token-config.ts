import { getTokens } from "src/ui/view-model/fungible-asset-view-factory"
import useSWR from "swr"

import { TokenStandards } from "@nfid/integration/token/types"

export const useTokenConfig = (asset: TokenStandards) => {
  const { data: configs, ...rest } = useSWR(asset + "tokenConfig", () =>
    getTokens(asset),
  )
  return { configs, ...rest }
}

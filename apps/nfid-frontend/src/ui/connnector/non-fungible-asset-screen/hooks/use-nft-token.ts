import { nftFactory } from "src/ui/connnector/non-fungible-asset-screen/non-fungible-asset-factory"
import useSWR from "swr"

import { AssetFilter, Blockchain } from "../../types"

type UseTokenConfig = {
  assetFilters: AssetFilter[]
  blockchains: Blockchain[]
}

export const useNFTConfig = ({ assetFilters, blockchains }: UseTokenConfig) => {
  const { data: configs, ...rest } = useSWR(
    ["useNftConfig", blockchains, assetFilters],
    ([key, blockchains, assetFilters]) =>
      Promise.all(
        blockchains.map(async (blockchain) => {
          try {
            return await nftFactory.getNFToken(blockchain, assetFilters)
          } catch (e) {
            console.error("useNftConfig", e)
            return []
          }
        }),
      ),
  )

  return { configs: configs?.flat() || [], ...rest }
}

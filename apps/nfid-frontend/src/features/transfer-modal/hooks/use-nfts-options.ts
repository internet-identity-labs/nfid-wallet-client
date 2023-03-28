import { useMemo } from "react"

import { useAllNFTs } from "frontend/apps/identity-manager/profile/assets/hooks"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"

import { mapUserNFTDetailsToGroupedOptions } from "../utils/map-nfts-to-options"

export const useNFTsOptions = () => {
  const { nfts } = useAllNFTs()
  const { applicationsMeta } = useApplicationsMeta()

  const nftsOptions = useMemo(() => {
    return mapUserNFTDetailsToGroupedOptions(nfts, applicationsMeta ?? [])
  }, [applicationsMeta, nfts])

  return { nftsOptions }
}

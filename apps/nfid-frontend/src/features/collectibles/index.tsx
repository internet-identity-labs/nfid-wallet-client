import { NFTs } from "packages/ui/src/organisms/nfts"
import useSWR from "swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { searchTokens } from "frontend/features/collectibles/utils/util"

import { fetchNFTs } from "./utils/util"

const ProfileCollectiblesPage = () => {
  const { data: nfts = [], isLoading } = useSWR("nfts", fetchNFTs)

  return (
    <NFTs
      nfts={nfts}
      isLoading={isLoading}
      searchTokens={searchTokens}
      links={ProfileConstants}
    />
  )
}

export default ProfileCollectiblesPage

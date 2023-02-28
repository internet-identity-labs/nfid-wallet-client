import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"

import { useAllNFTs } from "../assets/hooks"
import { ProfileCollectibles } from "./profile-collectibles"

const ProfileCollectiblesPage = () => {
  const { nfts } = useAllNFTs()
  const applications = useApplicationsMeta()

  return (
    <ProfileCollectibles
      isLoading={!nfts || applications.isLoading}
      tokens={nfts || []}
      applications={applications.applicationsMeta || []}
    />
  )
}

export default ProfileCollectiblesPage

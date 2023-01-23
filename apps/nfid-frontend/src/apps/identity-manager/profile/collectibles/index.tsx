import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllNFTs } from "frontend/state/hooks/nfts"

import { ProfileCollectibles } from "./profile-collectibles"

const ProfileCollectiblesPage = () => {
  const tokens = useAllNFTs()
  const applications = useApplicationsMeta()

  return (
    <ProfileCollectibles
      isLoading={!tokens.data || applications.isLoading}
      tokens={tokens.data || []}
      applications={applications.applicationsMeta || []}
    />
  )
}

export default ProfileCollectiblesPage

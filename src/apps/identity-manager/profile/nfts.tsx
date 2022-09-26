import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllNFTs } from "frontend/state/hooks/nfts"
import ProfileNFTsPage from "frontend/ui/pages/new-profile/nfts"

const ProfileNFTs = () => {
  const tokens = useAllNFTs()
  const applications = useApplicationsMeta()
  return (
    <ProfileNFTsPage
      isLoading={!tokens.data || applications.isLoading}
      tokens={tokens.data || []}
      applications={applications.applicationsMeta || []}
    />
  )
}

export default ProfileNFTs

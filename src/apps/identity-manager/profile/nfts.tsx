import {
  useApplicationsMeta,
} from "frontend/integration/identity-manager/queries"
import ProfileNFTsPage from "frontend/ui/pages/new-profile/nfts"
import { useAllNFTs } from "frontend/state/hooks/nfts"

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

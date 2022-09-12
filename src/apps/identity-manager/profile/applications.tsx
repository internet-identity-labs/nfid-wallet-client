import { useAccount } from "frontend/integration/identity-manager/queries"
import ProfileApplicationsPage from "frontend/ui/pages/new-profile/applications"

const ProfileApplications = () => {
  const { data: account } = useAccount()

  return <ProfileApplicationsPage applications={account?.accounts ?? []} />
}

export default ProfileApplications

import { useApplicationAccounts } from "frontend/integration/identity-manager/queries"
import ProfileApplicationsPage from "frontend/ui/pages/new-profile/applications"

const ProfileApplications = () => {
  const { applicationAccounts } = useApplicationAccounts()

  return <ProfileApplicationsPage applications={applicationAccounts} />
}

export default ProfileApplications

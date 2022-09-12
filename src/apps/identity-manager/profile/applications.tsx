import React from "react"

import { useAccount } from "frontend/integration/identity-manager/queries"
import ProfileApplicationsPage from "frontend/ui/pages/new-profile/applications"

const ProfileApplications = () => {
  const { data } = useAccount()

  return <ProfileApplicationsPage applications={data?.accounts ?? []} />
}

export default ProfileApplications

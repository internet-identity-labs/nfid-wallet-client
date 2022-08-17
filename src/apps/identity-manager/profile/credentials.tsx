import React from "react"

import { useAccount } from "frontend/integration/identity-manager/queries"
import ProfileCredentialsPage from "frontend/ui/pages/new-profile/credentials"

const ProfileCredentials = () => {
  const { data } = useAccount()
  return <ProfileCredentialsPage phone={data?.phoneNumber} />
}

export default ProfileCredentials

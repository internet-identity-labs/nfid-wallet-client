import React from "react"
import useSWR from "swr"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { useAccount } from "frontend/integration/identity-manager/queries"
import { authState } from "frontend/integration/internet-identity"
import { decryptStringForIdentity } from "frontend/integration/lambda/symmetric"
import ProfileCredentialsPage from "frontend/ui/pages/new-profile/credentials"

const ProfileCredentials = () => {
  const { data } = useAccount()
  const { data: decryptedPhone, isValidating } = useSWR(
    "decryptPhoneNumber",
    async () => {
      const phone = data?.phoneNumber
      const delegation = authState.get().delegationIdentity

      if (!phone || !delegation) return ""
      return await decryptStringForIdentity(phone, delegation)
    },
  )

  if (isValidating) return <Loader isLoading={true} />
  return (
    <ProfileCredentialsPage phone={decryptedPhone ?? data?.phoneNumber ?? ""} />
  )
}

export default ProfileCredentials

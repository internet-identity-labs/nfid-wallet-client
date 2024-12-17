import { useProfile } from "src/integration/identity-manager/queries"
import { useSWR } from "@nfid/swr"

import { authState } from "@nfid/integration"

import { decryptStringForIdentity } from "frontend/integration/lambda/symmetric"
import ProfileCredentialsPage from "frontend/ui/pages/new-profile/credentials"

const ProfileCredentials = () => {
  const { profile } = useProfile()
  const { delegationIdentity } = authState.get()

  const {
    data: decryptedPhone,
    error,
    isValidating,
  } = useSWR(
    profile?.phoneNumber && delegationIdentity
      ? ["decryptedPhone", profile.phoneNumber, delegationIdentity]
      : null,

    async ([, phoneNumber, delegationIdentity]) => {
      const result = await decryptStringForIdentity(
        phoneNumber,
        delegationIdentity,
      )
      return result
    },
  )

  return (
    <ProfileCredentialsPage
      phone={decryptedPhone || error}
      isLoading={isValidating}
    />
  )
}

export default ProfileCredentials

import { useProfile } from "src/integration/identity-manager/queries"

import { authState } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { decryptStringForIdentity } from "frontend/integration/lambda/symmetric"
import { ProfileCredentialsPage } from "@nfid-frontend/ui"
import { ProfileConstants } from "./routes"

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
      addPhoneNumberRoute={ProfileConstants.addPhoneNumber}
    />
  )
}

export default ProfileCredentials

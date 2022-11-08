import { authState } from "@nfid/integration"
import { useProfile } from "src/integration/identity-manager/queries"
import useSWR from "swr"

import { decryptStringForIdentity } from "frontend/integration/lambda/symmetric"
import ProfileCredentialsPage from "frontend/ui/pages/new-profile/credentials"

const ProfileCredentials = () => {
  const { profile } = useProfile()
  const { delegationIdentity } = authState.get()

  const { data: decryptedPhone, isValidating } = useSWR(
    profile?.phoneNumber && delegationIdentity ? "decryptedPhone" : null,
    async () => {
      if (!profile?.phoneNumber || !delegationIdentity)
        throw new Error("ProfileCredentials unauthenticated")

      try {
        const result = await decryptStringForIdentity(
          profile?.phoneNumber,
          delegationIdentity,
        )
        return result
      } catch (e) {
        console.log({ e })
      }
    },
  )

  return (
    <ProfileCredentialsPage phone={decryptedPhone} isLoading={isValidating} />
  )
}

export default ProfileCredentials

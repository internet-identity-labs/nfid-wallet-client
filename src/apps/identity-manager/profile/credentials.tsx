import React from "react"

import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { authState } from "frontend/integration/internet-identity"
import { decryptStringForIdentity } from "frontend/integration/lambda/symmetric"
import ProfileCredentialsPage from "frontend/ui/pages/new-profile/credentials"

const ProfileCredentials = () => {
  const { profile } = useAccount()
  const [isLoading, setIsLoading] = React.useState(false)
  const [decryptedPhone, setDecryptedPhone] = React.useState("")

  const decryptPhone = React.useCallback(async (phone?: string) => {
    const delegation = authState.get().delegationIdentity

    if (!phone || !delegation) return ""

    try {
      setIsLoading(true)
      const result = await decryptStringForIdentity(phone, delegation)
      setDecryptedPhone(result)
    } catch (e) {
      console.log({ e })
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    decryptPhone(profile?.phoneNumber)
  }, [profile?.phoneNumber, decryptPhone])

  return <ProfileCredentialsPage phone={decryptedPhone} isLoading={isLoading} />
}

export default ProfileCredentials

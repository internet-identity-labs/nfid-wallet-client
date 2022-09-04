import React from "react"

import { useAccount } from "frontend/integration/identity-manager/queries"
import { authState } from "frontend/integration/internet-identity"
import { decryptStringForIdentity } from "frontend/integration/lambda/symmetric"
import ProfileCredentialsPage from "frontend/ui/pages/new-profile/credentials"

const ProfileCredentials = () => {
  const { data } = useAccount()
  const [isLoading, setIsLoading] = React.useState(false)
  const [decryptedPhone, setDecryptedPhone] = React.useState("")

  const decryptPhone = React.useCallback(async (phone?: string) => {
    setIsLoading(true)
    const delegation = authState.get().delegationIdentity

    if (!phone || !delegation) return ""

    const result = await decryptStringForIdentity(phone, delegation)
    setDecryptedPhone(result)

    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    decryptPhone(data?.phoneNumber)
  }, [data?.phoneNumber, decryptPhone])

  return <ProfileCredentialsPage phone={decryptedPhone} isLoading={isLoading} />
}

export default ProfileCredentials

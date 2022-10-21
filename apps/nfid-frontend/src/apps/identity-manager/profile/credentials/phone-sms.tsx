import { useAtom } from "jotai"
import React from "react"
import { toast } from "react-toastify"

import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { authState } from "frontend/integration/internet-identity"
import { verifyPhoneNumber } from "frontend/integration/lambda/phone"
import ProfileAddPhoneSMS from "frontend/ui/pages/new-profile/credentials/add-phone-sms"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"
import { phoneNumberAtom } from "../state"

const ProfileSMS = () => {
  const [phone] = useAtom(phoneNumberAtom)

  const [isLoading, toggleLoading] = React.useReducer((s) => !s, false)
  const [error, setError] = React.useState("")
  const { navigate } = useNFIDNavigate()
  const { refreshProfile } = useAccount()
  const { delegationIdentity } = authState.get()

  const navigateToCredentials = React.useCallback(() => {
    return navigate(`${ProfileConstants.base}/${ProfileConstants.credentials}`)
  }, [navigate])

  React.useEffect(() => {
    if (!phone) navigateToCredentials()
  }, [navigateToCredentials, phone])

  const handleSubmitSMSToken = React.useCallback(
    async (token: string) => {
      toggleLoading()
      const response = await im.verify_token(token).catch((e) => {
        throw new Error(`handleSubmitSMSToken im.verify_token: ${e.message}`)
      })
      toggleLoading()
      if (response.status_code >= 200 && response.status_code < 400) {
        refreshProfile()
        return navigateToCredentials()
      }
      if (response.error.length) setError(response.error[0])
    },
    [navigateToCredentials, refreshProfile],
  )

  const handleResendToken = React.useCallback(async () => {
    if (!delegationIdentity) throw new Error("User delegation is undefined")

    try {
      setError("")
      await verifyPhoneNumber(phone as string, delegationIdentity)
    } catch (e: any) {
      console.log({ e })
      if (e.message) setError(e.message)
      else {
        toast.error("We were not able to resend code. Please try again")
        navigateToCredentials()
      }
    }
  }, [delegationIdentity, navigateToCredentials, phone])

  return (
    <ProfileAddPhoneSMS
      phone={phone as string}
      onSubmit={handleSubmitSMSToken}
      isLoading={isLoading}
      responseError={error}
      onResendCode={handleResendToken}
      resetResponseError={() => setError("")}
    />
  )
}

export default ProfileSMS

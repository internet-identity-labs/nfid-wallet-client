import { useAtom } from "jotai"
import React from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import ProfileAddPhoneSMS from "frontend/ui/pages/new-profile/credentials/add-phone-sms"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"
import { phoneNumberAtom } from "../state"

const ProfileSMS = () => {
  const [phone] = useAtom(phoneNumberAtom)

  const [isLoading, toggleLoading] = React.useReducer((s) => !s, false)
  const [error, setError] = React.useState("")
  const { user } = useAuthentication()
  const { navigate } = useNFIDNavigate()
  const { refreshProfile, verifyPhonenumber } = useAccount()

  const handleSubmitSMSToken = React.useCallback(
    async (token: string) => {
      toggleLoading()
      const response = await im.verify_token(token).catch((e) => {
        throw new Error(`handleSubmitSMSToken im.verify_token: ${e.message}`)
      })
      toggleLoading()
      if (response.status_code >= 200 && response.status_code < 400) {
        refreshProfile()
        return navigate(
          `${ProfileConstants.base}/${ProfileConstants.credentials}`,
        )
      }
      if (response.error.length) setError(response.error[0])
    },
    [navigate, refreshProfile],
  )

  const handleResendToken = React.useCallback(async () => {
    toggleLoading()
    const response = await verifyPhonenumber(
      phone as string,
      user?.principal as string,
    )
    toggleLoading()
    setError(response.body.error)
  }, [phone, user?.principal, verifyPhonenumber])

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

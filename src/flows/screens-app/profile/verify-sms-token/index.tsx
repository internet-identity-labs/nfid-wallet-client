import { useAtom } from "jotai"
import React from "react"

import { im } from "frontend/api/actors"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { ProfileEditPhoneSms } from "frontend/screens/profile-edit/phone-sms"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { ProfileConstants } from "../routes"
import { phoneNumberAtom } from "../state"

interface AuthenticateNFIDHomeProps {}

export const VerifySMSToken: React.FC<AuthenticateNFIDHomeProps> = () => {
  const [phone] = useAtom(phoneNumberAtom)

  const [isLoading, toggleLoading] = React.useReducer((s) => !s, false)
  const [error, setError] = React.useState("")
  const { user } = useAuthentication()
  const { verifyPhonenumber } = useAccount()
  const { navigate } = useNFIDNavigate()

  const handleSubmitSMSToken = React.useCallback(
    async (token: string) => {
      toggleLoading()
      const response = await im.verify_token(token)
      toggleLoading()
      if (response.status_code >= 200 && response.status_code < 400) {
        return navigate(
          `${ProfileConstants.base}/${ProfileConstants.authenticate}`,
        )
      }
      if (response.error.length) setError(response.error[0])
    },
    [navigate],
  )

  const handleResendToken = React.useCallback(async () => {
    toggleLoading()
    const response = await verifyPhonenumber(
      phone as string,
      user?.principal as string,
    )
    toggleLoading()
    if (response.status >= 200 && response.status < 400) {
      return navigate(
        `${ProfileConstants.base}/${ProfileConstants.authenticate}`,
      )
    }
    setError(response.body.error)
  }, [navigate, phone, user?.principal, verifyPhonenumber])

  return (
    <ProfileEditPhoneSms
      phone={phone as string}
      onSubmit={handleSubmitSMSToken}
      isLoading={isLoading}
      responseError={error}
      onResendCode={handleResendToken}
    />
  )
}

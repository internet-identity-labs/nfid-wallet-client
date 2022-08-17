import { useAtom } from "jotai"
import React from "react"

import { im } from "frontend/integration/actors"
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
  const { delegationIdentity } = authState.get()

  const handleSubmitSMSToken = React.useCallback(
    async (token: string) => {
      toggleLoading()
      const response = await im.verify_token(token).catch((e) => {
        throw new Error(`handleSubmitSMSToken im.verify_token: ${e.message}`)
      })
      toggleLoading()
      if (response.status_code >= 200 && response.status_code < 400) {
        return navigate(
          `${ProfileConstants.base}/${ProfileConstants.credentials}`,
        )
      }
      if (response.error.length) setError(response.error[0])
    },
    [navigate],
  )

  const handleResendToken = React.useCallback(async () => {
    if (!delegationIdentity) throw new Error("User delegation is undefined")
    toggleLoading()
    try {
      await verifyPhoneNumber(phone as string, delegationIdentity)
    } catch (e: any) {
      if (e.error) setError(e.error)
      else setError("This phone number is already registered")
      console.debug("handleSubmitPhoneNumber", e)
    } finally {
      toggleLoading()
    }
  }, [delegationIdentity, phone])

  return (
    <ProfileAddPhoneSMS
      onResendCode={handleResendToken}
      onSubmit={handleSubmitSMSToken}
      isLoading={isLoading}
      phone={phone ?? 0}
      responseError={error}
    />
  )
}

export default ProfileSMS

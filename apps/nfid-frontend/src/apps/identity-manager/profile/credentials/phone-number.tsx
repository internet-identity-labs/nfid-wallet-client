import { useAtom } from "jotai"
import React from "react"

import { authState } from "@nfid/integration"

import { verifyPhoneNumber } from "frontend/integration/lambda/phone"
import ProfileAddPhoneNumber from "frontend/ui/pages/new-profile/credentials/add-phone-number"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"
import { phoneNumberAtom } from "../state"

const ProfilePhone = () => {
  const [, setPhoneNumber] = useAtom(phoneNumberAtom)
  const [isLoading, toggleLoading] = React.useReducer((s) => !s, false)
  const [error, setError] = React.useState("")
  const { navigate } = useNFIDNavigate()
  const { delegationIdentity } = authState.get()

  const handleSubmitPhoneNumber = React.useCallback(
    async ({ phone }: { phone: string }) => {
      if (!delegationIdentity) throw new Error("User delegation is undefined")
      toggleLoading()

      let response

      try {
        response = await verifyPhoneNumber(phone, delegationIdentity)
        setPhoneNumber(phone)

        return navigate(
          `${ProfileConstants.base}/${ProfileConstants.credentials}/${ProfileConstants.verifySMS}`,
        )
      } catch (e: any) {
        if (e.message) setError(e.message)
        else setError("This phone number is already registered")
        console.debug("handleSubmitPhoneNumber", e)
      } finally {
        toggleLoading()
      }
      return response
    },
    [delegationIdentity, navigate, setPhoneNumber],
  )
  return (
    <ProfileAddPhoneNumber
      onSubmit={handleSubmitPhoneNumber}
      isLoading={isLoading}
      responseError={error}
      setResponseError={setError}
    />
  )
}

export default ProfilePhone

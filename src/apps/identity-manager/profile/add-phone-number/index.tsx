import { useAtom } from "jotai"
import React from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorization } from "frontend/apps/authorization/use-authorization"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { authState } from "frontend/integration/internet-identity"
import { verifyPhoneNumber } from "frontend/integration/lambda/phone"
import { ProfileEditPhone } from "frontend/ui/pages/profile-edit/phone"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"
import { phoneNumberAtom } from "../state"

interface AuthenticateNFIDHomeProps {}

export const AddPhoneNumber: React.FC<AuthenticateNFIDHomeProps> = () => {
  const [, setPhoneNumber] = useAtom(phoneNumberAtom)
  const [isLoading, toggleLoading] = React.useReducer((s) => !s, false)
  const [error, setError] = React.useState("")
  const { user } = useAuthentication()
  const { account } = useAccount()
  const { navigate } = useNFIDNavigate()
  const { delegationIdentity } = authState.get()

  const handleSubmitPhoneNumber = React.useCallback(
    async ({ phone }: { phone: string }) => {
      if (!delegationIdentity) throw new Error("User delegation is undefined")
      let response
      toggleLoading()
      try {
        response = await verifyPhoneNumber(phone, delegationIdentity)
        setPhoneNumber(phone)
        return navigate(
          `${ProfileConstants.base}/${ProfileConstants.verifySMSToken}`,
        )
      } catch (e: any) {
        if (e.error) setError(e.error)
        else setError("This phone number is already registered")
        console.debug("handleSubmitPhoneNumber", e)
      } finally {
        toggleLoading()
      }
      return response
    },
    [navigate, setPhoneNumber, user?.principal, verifyPhoneNumber],
  )
  return (
    <ProfileEditPhone
      account={account}
      onSubmit={handleSubmitPhoneNumber}
      isLoading={isLoading}
      responseError={error}
    />
  )
}

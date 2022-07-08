import { useAtom } from "jotai"
import React from "react"

import { ProfileEditPhone } from "frontend/design-system/pages/profile-edit/phone"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"

import { ProfileConstants } from "../routes"
import { phoneNumberAtom } from "../state"

interface AuthenticateNFIDHomeProps { }

export const AddPhoneNumber: React.FC<AuthenticateNFIDHomeProps> = () => {
  const [, setPhoneNumber] = useAtom(phoneNumberAtom)
  const [isLoading, toggleLoading] = React.useReducer((s) => !s, false)
  const [error, setError] = React.useState("")
  const { user } = useAuthentication()
  const { account, verifyPhonenumber } = useAccount()
  const { navigate } = useNFIDNavigate()

  const handleSubmitPhoneNumber = React.useCallback(
    async ({ phone }: { phone: string }) => {
      toggleLoading()
      const response = await verifyPhonenumber(phone, user?.principal as string)
      toggleLoading()
      if (response.status >= 200 && response.status < 400) {
        setPhoneNumber(phone)
        return navigate(
          `${ProfileConstants.base}/${ProfileConstants.verifySMSToken}`,
        )
      }
      setError(response.body.error)
      return response
    },
    [navigate, setPhoneNumber, user?.principal, verifyPhonenumber],
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

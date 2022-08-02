import { useAtom } from "jotai"
import { useCallback, useReducer } from "react"

import { CredentialRequesterNotVerified } from "frontend/ui/pages/credential-requester/not-verified"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAccount } from "frontend/integration/services/identity-manager/account/hooks"

export const EnterPhoneNumber: React.FC<{ machine: any }> = ({ machine }) => {
  const [, send] = useAtom(machine)
  const [isLoading, toggleLoading] = useReducer((s) => !s, false)
  const { verifyPhonenumber, account } = useAccount()
  const { user } = useAuthentication()

  const handleSubmitPhoneNumber = useCallback(
    async ({ phone }: { phone: string }) => {
      toggleLoading()
      const response = await verifyPhonenumber(phone)
      toggleLoading()
      if (response.status >= 200 && response.status < 400) {
        console.log("success")
        send("VALID_PHONE_NUMBER")
      }
      return response
    },
    [account?.anchor, user?.principal, verifyPhonenumber],
  )

  return (
    <CredentialRequesterNotVerified
      onSubmit={(values) => {
        handleSubmitPhoneNumber(values)
      }}
      isLoading={isLoading}
    />
  )
}

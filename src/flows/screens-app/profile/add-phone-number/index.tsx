import React from "react"

import { ProfileEditPhone } from "frontend/screens/profile-edit/phone"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface AuthenticateNFIDHomeProps {}

export const AddPhoneNumber: React.FC<AuthenticateNFIDHomeProps> = () => {
  const { account } = useAccount()
  const handleSubmitPhoneNumber = React.useCallback(() => {
    console.log(">> handleSubmitPhoneNumber", {})
  }, [])
  return (
    <ProfileEditPhone account={account} onSubmit={handleSubmitPhoneNumber} />
  )
}

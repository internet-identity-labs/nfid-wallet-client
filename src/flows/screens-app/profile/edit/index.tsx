import React from "react"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { ProfileEdit } from "frontend/screens/profile-edit"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { ProfileConstants } from "../routes"

interface AuthenticateNFIDHomeProps {}

export const NFIDProfileEdit: React.FC<AuthenticateNFIDHomeProps> = () => {
  const { updateAccount, account } = useAccount()
  const { identityManager } = useAuthentication()
  const navigate = useNavigate()
  const { isLoading, setIsloading } = useIsLoading()

  const onSubmit = async (object: { name: string | undefined }) => {
    if (!identityManager) throw new Error("identityManager required")
    setIsloading(true)

    await updateAccount(identityManager, {
      name: object.name,
    })

    setIsloading(false)
    navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`, {
      replace: true,
    })
  }
  return (
    <ProfileEdit
      onSubmit={async (data: { name: string | undefined }) => onSubmit(data)}
      account={account}
      isLoading={isLoading}
    />
  )
}

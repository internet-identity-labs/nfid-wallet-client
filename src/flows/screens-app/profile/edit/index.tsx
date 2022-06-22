import React from "react"

import { im } from "frontend/api/actors"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { ProfileEdit } from "frontend/screens/profile-edit"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { ProfileConstants } from "../routes"

interface AuthenticateNFIDHomeProps {}

export const NFIDProfileEdit: React.FC<AuthenticateNFIDHomeProps> = () => {
  const { updateAccount, account } = useAccount()
  const { navigate, navigateFactory } = useNFIDNavigate()
  const { isLoading, setIsloading } = useIsLoading()

  const onSubmit = async (object: { name: string | undefined }) => {
    setIsloading(true)

    await updateAccount(im, {
      name: object.name,
    })

    setIsloading(false)
    navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`, {
      replace: true,
    })
  }
  return (
    <ProfileEdit
      onAddPhoneNumber={navigateFactory(
        `${ProfileConstants.base}/${ProfileConstants.addPhoneNumber}`,
      )}
      onSubmit={async (data: { name: string | undefined }) => onSubmit(data)}
      account={account}
      isLoading={isLoading}
    />
  )
}

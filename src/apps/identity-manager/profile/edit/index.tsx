import React from "react"

import { ProfileEdit } from "frontend/design-system/pages/profile-edit"

import { im } from "frontend/comm/actors"
import { useIsLoading } from "frontend/design-system/templates/app-screen/use-is-loading"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"

import { ProfileConstants } from "../routes"

interface AuthenticateNFIDHomeProps { }

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

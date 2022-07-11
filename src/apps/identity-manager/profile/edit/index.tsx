import React from "react"

import { ProfileEdit } from "frontend/design-system/pages/profile-edit"
import { useIsLoading } from "frontend/design-system/templates/app-screen/use-is-loading"

import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/services/identity-manager/account/hooks"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"

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
    navigate("/profile/authenticate", {
      replace: true,
    })
  }
  return (
    <ProfileEdit
      onAddPhoneNumber={navigateFactory("/profile/add-phone-number")}
      onSubmit={async (data: { name: string | undefined }) => onSubmit(data)}
      account={account}
      isLoading={isLoading}
    />
  )
}

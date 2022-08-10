import React from "react"

import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { ProfileEdit } from "frontend/ui/pages/profile-edit"
import { useIsLoading } from "frontend/ui/templates/app-screen/use-is-loading"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface AuthenticateNFIDHomeProps {}

export const NFIDProfileEdit: React.FC<AuthenticateNFIDHomeProps> = () => {
  const { updateAccount, profile } = useAccount()
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
      account={profile}
      isLoading={isLoading}
    />
  )
}

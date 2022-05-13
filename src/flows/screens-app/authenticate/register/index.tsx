import React from "react"

import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { RegisterAccountIntro } from "frontend/screens/register-account-intro/screen-app"

interface RouteRegisterProps {
  captchaPath: string
}

export const RouteRegister: React.FC<RouteRegisterProps> = ({
  captchaPath,
}) => {
  const { isLoading, setIsloading } = useIsLoading()
  const { applicationName, createWebAuthNIdentity } = useMultipass()
  const { navigate } = useNFIDNavigate()

  const handleCreateKeys = React.useCallback(async () => {
    setIsloading(true)
    const registerPayload = await createWebAuthNIdentity()

    navigate(captchaPath, {
      state: {
        registerPayload,
      },
    })
    setIsloading(false)
  }, [captchaPath, createWebAuthNIdentity, navigate, setIsloading])

  return (
    <RegisterAccountIntro
      isLoading={isLoading}
      applicationName={applicationName}
      onRegister={handleCreateKeys}
    />
  )
}

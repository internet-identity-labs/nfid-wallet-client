import React from "react"

import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { useChallenge } from "frontend/screens/captcha/hook"
import { RegisterAccountIntro } from "frontend/screens/register-account-intro/screen-app"

interface RouteRegisterProps {
  captchaPath: string
}

export const RouteRegister: React.FC<RouteRegisterProps> = ({
  captchaPath,
}) => {
  const { isLoading, setIsloading } = useIsLoading()
  const { applicationName, applicationLogo, createWebAuthNIdentity } =
    useMultipass()
  const { navigate } = useNFIDNavigate()

  // NOTE: the `getChallenge` gets called twice whithout this ref.
  const loaderRef = React.useRef(false)

  const { challenge, getChallenge } = useChallenge()
  React.useEffect(() => {
    if (!loaderRef.current && !challenge) {
      loaderRef.current = true
      getChallenge()
    }
  }, [challenge, getChallenge])

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
      applicationLogo={applicationLogo}
      onRegister={handleCreateKeys}
    />
  )
}

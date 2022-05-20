import React from "react"

import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { useChallenge } from "frontend/screens/captcha/hook"
import { RegisterAccountIntro } from "frontend/screens/register-account-intro/screen-app"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  captchaPath: string
}

export const RouteRegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
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

  const { challenge, getChallenge } = useChallenge()
  React.useEffect(() => {
    !challenge && getChallenge()
  }, [challenge, getChallenge])

  return (
    <RegisterAccountIntro
      isLoading={isLoading}
      applicationName={applicationName}
      onRegister={handleCreateKeys}
    />
  )
}

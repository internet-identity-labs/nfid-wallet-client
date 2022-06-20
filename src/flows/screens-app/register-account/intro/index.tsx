import React from "react"

import { GoogleCredential } from "frontend/design-system/atoms/button/signin-with-google"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { useChallenge } from "frontend/screens/captcha/hook"
import { RegisterAccountIntro } from "frontend/screens/register-account-intro/screen-app"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  captchaPath: string
  pathAuthorizeApp: string
}

export const RouteRegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  captchaPath,
  pathAuthorizeApp,
}) => {
  const { isLoading, setIsloading } = useIsLoading()
  const { applicationName, applicationLogo, createWebAuthNIdentity } =
    useMultipass()
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

  const { getChallenge } = useChallenge()
  const { getGoolgeDevice } = useDevices()
  const { loginWithGoogleDevice } = useAuthentication()
  const { readMemoryAccount } = useAccount()

  const handleGetGoogleKey = React.useCallback(
    async ({ credential }: GoogleCredential) => {
      console.log(">> handleGetGoogleKey", { credential })
      debugger

      getChallenge()
      setIsloading(true)
      const response = await getGoolgeDevice({ token: credential })
      // TODO:

      // Given: user is returning (response.is_existing)
      // Then: we need to authenticate with the google device
      // And: navigate to the authorize app screen
      if (response.is_existing) {
        await loginWithGoogleDevice(response.identity)
        await readMemoryAccount()
        return navigate(pathAuthorizeApp)
      }

      // Given: user new
      // Then: we need to navigate to captcha screen
      // And: register a new account
      navigate(captchaPath, {
        state: {
          registerPayload: {
            isGoogle: true,
            identity: response.identity,
            deviceName: "Google Device",
          },
        },
      })
      setIsloading(false)
    },
    [
      captchaPath,
      getChallenge,
      getGoolgeDevice,
      loginWithGoogleDevice,
      navigate,
      pathAuthorizeApp,
      readMemoryAccount,
      setIsloading,
    ],
  )

  return (
    <RegisterAccountIntro
      isLoading={isLoading}
      applicationName={applicationName}
      applicationLogo={applicationLogo}
      onRegister={handleCreateKeys}
      onSelectGoogleAuthorization={handleGetGoogleKey}
    />
  )
}

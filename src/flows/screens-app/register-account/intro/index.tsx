import React from "react"
import { useParams } from "react-router-dom"

import { CredentialResponse } from "frontend/design-system/atoms/button/signin-with-google/types"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { useChallenge } from "frontend/screens/captcha/hook"
import { RegisterAccountIntro } from "frontend/screens/register-account-intro/screen-app"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"

import { ProfileConstants } from "../../profile/routes"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  captchaPath: string
  pathOnAuthenticated: string
}

export const RouteRegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  captchaPath,
  pathOnAuthenticated,
}) => {
  const { isLoading, setIsloading } = useIsLoading()
  const { applicationName, applicationLogo, createWebAuthNIdentity } =
    useMultipass()
  const { navigate } = useNFIDNavigate()

  const { secret, scope } = useParams()

  const isNFID = React.useMemo(() => scope === "NFID", [scope])
  const { remoteNFIDLogin } = useAuthorizeApp()

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

  const { isLoading: isChallengeLoading } = useChallenge()
  console.log(">> RouteRegisterAccountIntro", { isChallengeLoading })

  const { getGoolgeDevice } = useDevices()
  const { loginWithGoogleDevice } = useAuthentication()
  const { readMemoryAccount } = useAccount()

  const handleGetGoogleKey = React.useCallback(
    async ({ credential }: CredentialResponse) => {
      console.log(">> handleGetGoogleKey", { credential })

      setIsloading(true)
      const response = await getGoolgeDevice({ token: credential })

      // Given: user is returning (response.is_existing)
      // Then: we need to authenticate with the google device
      // And: navigate to the authorize app screen
      if (response.is_existing) {
        const userOverwrite = await loginWithGoogleDevice(response.identity)
        const {
          data: [account],
        } = await readMemoryAccount()
        if (isNFID && account) {
          if (!secret) throw new Error("secret missing")
          await remoteNFIDLogin({
            secret,
            userNumberOverwrite: account.anchor,
            userOverwrite,
          })
          return navigate(
            `${ProfileConstants.base}/${ProfileConstants.authenticate}`,
          )
        }
        return navigate(pathOnAuthenticated)
      }

      console.log(">> ", { response })

      // Given: user new
      // Then: we need to navigate to captcha screen
      // And: register a new account
      navigate(captchaPath, {
        state: {
          registerPayload: {
            isGoogle: true,
            identity: response.identity,
            deviceName: "Google account",
          },
        },
      })
      setIsloading(false)
    },
    [
      captchaPath,
      getGoolgeDevice,
      isNFID,
      loginWithGoogleDevice,
      navigate,
      pathOnAuthenticated,
      readMemoryAccount,
      remoteNFIDLogin,
      secret,
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

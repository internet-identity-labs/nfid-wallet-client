import React from "react"
import { useParams } from "react-router-dom"

import { CredentialResponse } from "frontend/design-system/atoms/button/signin-with-google/types"
import { useChallenge } from "frontend/design-system/pages/captcha/hook"
import { RegisterAccountIntro } from "frontend/design-system/pages/register-account-intro/screen-app"
import { useIsLoading } from "frontend/design-system/templates/app-screen/use-is-loading"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"
import { useDevices } from "frontend/comm/services/identity-manager/devices/hooks"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  captchaPath: string
  pathOnAuthenticated: string
  isNFID?: boolean
  isRemoteRegiser?: boolean
}

export const RouteRegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  captchaPath,
  pathOnAuthenticated,
  isNFID: isNFIDProp,
  isRemoteRegiser,
}) => {
  const { isLoading, setIsloading } = useIsLoading()
  const { applicationName, applicationLogo, createWebAuthNIdentity } =
    useMultipass()
  const { navigate } = useNFIDNavigate()

  const { secret, scope } = useParams()

  const isNFID = React.useMemo(
    () => scope === "NFID" || isNFIDProp,
    [isNFIDProp, scope],
  )

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

  // NOTE: this will start loading the challenge
  useChallenge()

  const { getGoogleDevice } = useDevices()
  const { loginWithGoogleDevice } = useAuthentication()
  const { readMemoryAccount } = useAccount()

  const handleGetGoogleKey = React.useCallback(
    async ({ credential }: CredentialResponse) => {
      setIsloading(true)
      const response = await getGoogleDevice({ token: credential })

      // Returning user has a key pair
      if (response.is_existing) {
        const userOverwrite = await loginWithGoogleDevice(response.identity)

        const {
          data: [account],
        } = await readMemoryAccount()

        if (isNFID && account) {
          if (isRemoteRegiser) {
            if (!secret) throw new Error("secret missing")
            await remoteNFIDLogin({
              secret,
              userNumberOverwrite: account.anchor,
              userOverwrite,
            })
          }
          return navigate("/profile/authenticate")
        }
        // when we're not on NFID we're handling the authorization on
        // the next page
        return navigate(pathOnAuthenticated)
      }

      // new google user send to register
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
      getGoogleDevice,
      isNFID,
      isRemoteRegiser,
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

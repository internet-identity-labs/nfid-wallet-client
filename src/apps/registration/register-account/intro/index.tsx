import React from "react"
import { useParams } from "react-router-dom"

import {
  APP_SCREEN_AUTHENTICATE_BASE,
  SUB_PATH_AUTHORIZE_APP,
} from "frontend/apps/authentication/authenticate/constants"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
import { usePersona } from "frontend/integration/identity-manager/persona/hooks"
import { CredentialResponse } from "frontend/ui/atoms/button/signin-with-google/types"
import { useChallenge } from "frontend/ui/pages/captcha/hook"
import { RegisterAccountIntro } from "frontend/ui/pages/register-account-intro/screen-app"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  captchaPath: string
  pathOnAuthenticated: string
  isNFID?: boolean
  isRemoteRegister?: boolean
}

export const RouteRegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  captchaPath,
  pathOnAuthenticated,
  isNFID: isNFIDProp,
  isRemoteRegister,
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [authError, setAuthError] = React.useState<string | undefined>()
  const { applicationName, applicationLogo, createWebAuthNIdentity } =
    useMultipass()
  const { navigate } = useNFIDNavigate()

  const { secret, scope } = useParams()

  const isNFID = React.useMemo(
    () => scope === "NFID" || isNFIDProp,
    [isNFIDProp, scope],
  )

  const { remoteNFIDLogin } = useAuthorizeApp()
  const { getPersona } = usePersona()

  const handleCreateKeys = React.useCallback(async () => {
    setIsLoading(true)
    const registerPayload = await createWebAuthNIdentity()

    navigate(captchaPath, {
      state: {
        registerPayload,
      },
    })
    setIsLoading(false)
  }, [captchaPath, createWebAuthNIdentity, navigate, setIsLoading])

  // NOTE: this will start loading the challenge
  useChallenge()

  const { getGoogleDevice } = useDevices()
  const { user, loginWithGoogleDevice, login, setShouldStoreLocalAccount } =
    useAuthentication()
  const { readMemoryAccount, readAccount } = useAccount()

  const handleGetGoogleKey = React.useCallback(
    async ({ credential }: CredentialResponse) => {
      setIsLoading(true)
      const response = await getGoogleDevice({ token: credential })

      // Returning user has a key pair
      if (response.is_existing) {
        const userOverwrite = await loginWithGoogleDevice(response.identity)

        const account = await readMemoryAccount()

        if (isNFID && account) {
          if (isRemoteRegister) {
            if (!secret)
              throw new Error(
                "RouteRegisterAccountIntro.handleGetGoogleKey secret missing",
              )
            await remoteNFIDLogin({
              secret,
              userNumberOverwrite: BigInt(account.anchor),
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
      setIsLoading(false)
    },
    [
      captchaPath,
      getGoogleDevice,
      isNFID,
      isRemoteRegister,
      loginWithGoogleDevice,
      navigate,
      pathOnAuthenticated,
      readMemoryAccount,
      remoteNFIDLogin,
      secret,
    ],
  )

  const handleAuthorization =
    ({ withSecurityDevices }: { withSecurityDevices: boolean }) =>
    async (userNumber: number) => {
      setIsLoading(true)
      const response = await login(BigInt(userNumber), withSecurityDevices)

      if (response.tag === "ok") {
        withSecurityDevices && setShouldStoreLocalAccount(false)
        setIsLoading(false)
      }
      if (response.tag === "err") {
        setAuthError(response.title)
        setIsLoading(false)
      }
    }

  React.useEffect(() => {
    if (user) {
      readAccount()
      getPersona()
      navigate(`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`)
    }
  }, [getPersona, user, navigate, readAccount])

  return (
    <RegisterAccountIntro
      isLoading={isLoading}
      applicationName={applicationName}
      applicationLogo={applicationLogo}
      onRegister={handleCreateKeys}
      onSelectGoogleAuthorization={handleGetGoogleKey}
      onSelectSameDeviceAuthorization={handleAuthorization({
        withSecurityDevices: false,
      })}
      onSelectSecurityKeyAuthorization={handleAuthorization({
        withSecurityDevices: true,
      })}
      authError={authError}
    />
  )
}

import React from "react"
import { useParams } from "react-router-dom"

import {
  useAuthentication,
  User,
} from "frontend/apps/authentication/use-authentication"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { agent } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
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
  isRemoteRegister?: boolean
}

export const RouteRegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  captchaPath,
  isRemoteRegister,
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [authError, setAuthError] = React.useState<string | undefined>()
  const { applicationName, applicationLogo, createWebAuthNIdentity } =
    useMultipass()
  const [showAdvancedOptions, toggleAdvancedOptions] = React.useReducer(
    (state) => !state,
    false,
  )
  const { navigate } = useNFIDNavigate()

  const { secret } = useParams()

  const { remoteNFIDLogin } = useAuthorizeApp()

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
  const { loginWithGoogleDevice, login, setShouldStoreLocalAccount } =
    useAuthentication()
  const { readMemoryAccount } = useAccount()

  const handleRemoteLogin = React.useCallback(
    async (userOverwrite: User, userNumberOverwrite: bigint) => {
      if (isRemoteRegister) {
        if (!secret)
          throw new Error(
            "RouteRegisterAccountIntro.handleGetGoogleKey secret missing",
          )
        await remoteNFIDLogin({
          secret,
          userNumberOverwrite,
          userOverwrite,
        })
      }
      return navigate("/profile/assets")
    },
    [isRemoteRegister, navigate, remoteNFIDLogin, secret],
  )

  const handleGetGoogleKey = React.useCallback(
    async ({ credential }: CredentialResponse) => {
      setIsLoading(true)
      const response = await getGoogleDevice({ token: credential })

      // Returning user has a key pair
      if (response.is_existing) {
        const userOverwrite = await loginWithGoogleDevice(response.identity)

        const account = await readMemoryAccount()
        return await handleRemoteLogin(userOverwrite, BigInt(account.anchor))
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
      handleRemoteLogin,
      loginWithGoogleDevice,
      navigate,
      readMemoryAccount,
    ],
  )

  const handleAuthorization =
    ({ withSecurityDevices }: { withSecurityDevices: boolean }) =>
    async (userNumber: number) => {
      setIsLoading(true)
      const response = await login(BigInt(userNumber), withSecurityDevices)
      console.debug("handleAuthorization", { response })

      if (response.tag === "ok") {
        withSecurityDevices && setShouldStoreLocalAccount(false)
        await handleRemoteLogin(
          { ...response, principal: (await agent.getPrincipal()).toText() },
          BigInt(userNumber),
        )
        setIsLoading(false)
      }
      if (response.tag === "err") {
        setAuthError(response.message)
        setIsLoading(false)
      }
    }

  return (
    <RegisterAccountIntro
      isLoading={isLoading}
      applicationName={applicationName}
      applicationLogo={applicationLogo}
      onToggleAdvancedOptions={toggleAdvancedOptions}
      showAdvancedOptions={showAdvancedOptions}
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

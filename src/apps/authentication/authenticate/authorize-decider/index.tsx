import React from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
import { usePersona } from "frontend/integration/identity-manager/persona/hooks"
import { CredentialResponse } from "frontend/ui/atoms/button/signin-with-google/types"
import { AuthorizeDecider } from "frontend/ui/pages/authorize-decider"
import { useChallenge } from "frontend/ui/pages/captcha/hook"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface AuthorizeDeciderProps {
  pathRegisterSameDevice: string
  pathRemoteAuthorization: string
  pathAuthorizeApp: string
  pathCaptcha: string
}

export const AppScreenAuthorizeDecider: React.FC<AuthorizeDeciderProps> = ({
  pathRegisterSameDevice,
  pathRemoteAuthorization,
  pathAuthorizeApp,
  pathCaptcha,
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [authError, setAuthError] = React.useState<string | undefined>()
  const { applicationName, applicationLogo, createWebAuthNIdentity } =
    useMultipass()
  const [showAdvancedOptions, toggleAdvancedOptions] = React.useReducer(
    (state) => !state,
    false,
  )
  const { user, login, setShouldStoreLocalAccount, loginWithGoogleDevice } =
    useAuthentication()
  const { getGoogleDevice } = useDevices()
  const { getPersona } = usePersona()
  const { readAccount, readMemoryAccount } = useAccount()

  // NOTE: this will start loading the challenge
  useChallenge()

  const { navigateFactory, navigate } = useNFIDNavigate()

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

  const handleCreateKeys = React.useCallback(async () => {
    setIsLoading(true)
    const registerPayload = await createWebAuthNIdentity()

    navigate(pathCaptcha, {
      state: {
        registerPayload,
      },
    })
    setIsLoading(false)
  }, [createWebAuthNIdentity, navigate, pathCaptcha])

  const handleGetGoogleKey = React.useCallback(
    async ({ credential }: CredentialResponse) => {
      setIsLoading(true)

      const response = await getGoogleDevice({ token: credential })

      // Given: user is returning (response.is_existing)
      // Then: we need to authenticate with the google device
      // And: navigate to the authorize app screen
      if (response.is_existing) {
        await loginWithGoogleDevice(response.identity)
        await Promise.all([readMemoryAccount(), getPersona()])
        return navigate(pathAuthorizeApp)
      }

      // Given: user new
      // Then: we need to navigate to captcha screen
      // And: register a new account
      navigate(pathCaptcha, {
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
      getGoogleDevice,
      getPersona,
      loginWithGoogleDevice,
      navigate,
      pathAuthorizeApp,
      pathCaptcha,
      readMemoryAccount,
    ],
  )

  // TODO: we need to find a better way to store the actors.
  // This is because we currently store them with a setState on jotai atom.
  // And this means when we await the login response and call the readAccount
  // or getPersona directly within the same handler, the actors will be undefined.
  React.useEffect(() => {
    if (user) {
      readAccount()
      getPersona()
      navigate(pathAuthorizeApp)
    }
  }, [getPersona, user, navigate, pathAuthorizeApp, readAccount])

  return (
    <AuthorizeDecider
      applicationName={applicationName}
      applicationLogo={applicationLogo}
      isLoading={isLoading}
      onSelectSameDeviceRegistration={handleCreateKeys}
      onSelectRemoteAuthorization={navigateFactory(pathRemoteAuthorization)}
      onSelectSameDeviceAuthorization={handleAuthorization({
        withSecurityDevices: false,
      })}
      onSelectSecurityKeyAuthorization={handleAuthorization({
        withSecurityDevices: true,
      })}
      onSelectGoogleAuthorization={handleGetGoogleKey}
      onToggleAdvancedOptions={toggleAdvancedOptions}
      showAdvancedOptions={showAdvancedOptions}
      authError={authError}
    />
  )
}

import React from "react"

import { GoogleCredential } from "frontend/design-system/atoms/button/signin-with-google"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { AuthorizeDecider } from "frontend/screens/authorize-decider"
import { useChallenge } from "frontend/screens/captcha/hook"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

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
  const { getGoolgeDevice } = useDevices()
  const { getPersona } = usePersona()
  const { readAccount, readMemoryAccount } = useAccount()
  const { getChallenge } = useChallenge()

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
    getChallenge()
    setIsLoading(true)
    const registerPayload = await createWebAuthNIdentity()

    navigate(pathCaptcha, {
      state: {
        registerPayload,
      },
    })
    setIsLoading(false)
  }, [createWebAuthNIdentity, getChallenge, navigate, pathCaptcha])

  const handleGetGoogleKey = React.useCallback(
    async ({ credential }: GoogleCredential) => {
      getChallenge()
      setIsLoading(true)
      const response = await getGoolgeDevice({ token: credential })

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
      getChallenge,
      getGoolgeDevice,
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

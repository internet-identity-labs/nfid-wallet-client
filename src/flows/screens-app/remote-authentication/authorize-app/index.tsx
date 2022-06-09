import React from "react"
import { useParams } from "react-router-dom"

import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { AuthorizeApp } from "frontend/screens/authorize-app"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

import { ProfileConstants } from "../../profile/routes"
import { RemoteRegisterAccountConstants } from "../../register-account/routes"

interface AppScreenAuthorizeAppProps {}

export const AppScreenAuthorizeApp: React.FC<
  AppScreenAuthorizeAppProps
> = () => {
  const { isLoading, setIsloading } = useIsLoading()
  const { secret, scope } = useParams()
  const { sendWaitForUserInput } = useAuthorizeApp()
  const { nextPersonaId, accounts, createPersona, getPersona } = usePersona()
  const { isAuthenticated, login } = useAuthentication()
  const { applicationName, applicationLogo } = useMultipass()
  const { navigate } = useNFIDNavigate()

  const { remoteLogin } = useAuthorizeApp()

  React.useEffect(() => {
    isAuthenticated && getPersona()
  }, [isAuthenticated, getPersona])

  React.useEffect(() => {
    secret && isAuthenticated && sendWaitForUserInput(secret)
  }, [isAuthenticated, secret, sendWaitForUserInput])

  const handleLogin = React.useCallback(
    async (personaId: string) => {
      if (!secret || !scope)
        throw new Error("missing secret, scope or persona_id")

      setIsloading(true)
      await remoteLogin({ secret, scope, persona_id: personaId })
      setIsloading(false)
      navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
    },
    [navigate, remoteLogin, scope, secret, setIsloading],
  )

  const handleCreateAccountAndLogin = React.useCallback(async () => {
    setIsloading(true)
    const response = await createPersona({
      domain: scope,
    })

    if (response?.status_code === 200) {
      return handleLogin(nextPersonaId)
    }
    setIsloading(false)
  }, [createPersona, handleLogin, nextPersonaId, scope, setIsloading])

  const { userNumber } = useAccount()
  React.useEffect(() => {
    if (!userNumber) {
      navigate(
        `${RemoteRegisterAccountConstants.base}/${RemoteRegisterAccountConstants.intro}`,
      )
    }
  }, [navigate, userNumber])

  return (
    <ScreenResponsive
      isLoading={isLoading}
      loadingMessage=""
      className="flex flex-col items-center"
    >
      <AuthorizeApp
        isRemoteAuthorisation
        isAuthenticated={isAuthenticated}
        applicationName={applicationName || ""}
        applicationLogo={applicationLogo}
        onUnlockNFID={login}
        onLogin={handleLogin}
        onCreateAccount={handleCreateAccountAndLogin}
        accounts={accounts}
      />
    </ScreenResponsive>
  )
}

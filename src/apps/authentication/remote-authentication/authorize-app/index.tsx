import React from "react"
import { useParams } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { usePersona } from "frontend/integration/identity-manager/persona/hooks"
import { AuthorizeApp } from "frontend/ui/pages/authorize-app"
import { useIsLoading } from "frontend/ui/templates/app-screen/use-is-loading"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { RemoteRegisterAccountConstants } from "../../../registration/register-account/routes"

interface AppScreenAuthorizeAppProps {}

export const AppScreenAuthorizeApp: React.FC<
  AppScreenAuthorizeAppProps
> = () => {
  const { isLoading, setIsloading } = useIsLoading()
  const { secret, scope, derivationOrigin } = useParams()
  const { sendWaitForUserInput } = useAuthorizeApp()
  const { nextPersonaId, accounts, createPersona, getPersona } = usePersona()
  const { user, login } = useAuthentication()
  const { applicationName, applicationLogo } = useMultipass()
  const { navigate } = useNFIDNavigate()

  const { remoteLogin } = useAuthorizeApp()

  React.useEffect(() => {
    user && getPersona()
  }, [user, getPersona])

  React.useEffect(() => {
    secret && user && sendWaitForUserInput(secret)
  }, [user, secret, sendWaitForUserInput])

  const handleLogin = React.useCallback(
    async (personaId: string) => {
      if (!secret)
        throw new Error(`AppScreenAuthorizeApp.handleLogin missing secret`)
      if (!scope)
        throw new Error(`AppScreenAuthorizeApp.handleLogin missing scope`)
      if (!user?.chain)
        throw new Error(`AppScreenAuthorizeApp.handleLogin missing user.chain`)
      if (!user?.sessionKey)
        throw new Error(
          `AppScreenAuthorizeApp.handleLogin missing user.sessionKey`,
        )

      setIsloading(true)
      await remoteLogin({
        secret,
        scope,
        persona_id: personaId,
        chain: user?.chain,
        sessionKey: user?.sessionKey,
        derivationOrigin,
      })
      setIsloading(false)
      navigate("/profile/security")
    },
    [
      derivationOrigin,
      navigate,
      remoteLogin,
      scope,
      secret,
      setIsloading,
      user?.chain,
      user?.sessionKey,
    ],
  )

  const handleCreateAccountAndLogin = React.useCallback(async () => {
    setIsloading(true)
    const response = await createPersona({
      domain: scope as string,
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
        isAuthenticated={!!user}
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

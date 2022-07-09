import React from "react"
import { useParams } from "react-router-dom"

import { AuthorizeApp } from "frontend/design-system/pages/authorize-app"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useIsLoading } from "frontend/design-system/templates/app-screen/use-is-loading"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"
import { usePersona } from "frontend/comm/services/identity-manager/persona/hooks"

import { ProfileConstants } from "../../../identity-manager/profile/routes"
import { RemoteRegisterAccountConstants } from "../../../registration/register-account/routes"

interface AppScreenAuthorizeAppProps { }

export const AppScreenAuthorizeApp: React.FC<
  AppScreenAuthorizeAppProps
> = () => {
  const { isLoading, setIsloading } = useIsLoading()
  const { secret, scope } = useParams()
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
      if (!secret) throw new Error("missing secret")
      if (!scope) throw new Error("missing scope")
      if (!user?.chain) throw new Error("missing user.chain")
      if (!user?.sessionKey) throw new Error("missing user.sessionKey")

      setIsloading(true)
      await remoteLogin({
        secret,
        scope,
        persona_id: personaId,
        chain: user?.chain,
        sessionKey: user?.sessionKey,
        connection: user?.internetIdentity,
      })
      setIsloading(false)
      navigate(`${ProfileConstants.base}/${ProfileConstants.authenticate}`)
    },
    [
      navigate,
      remoteLogin,
      scope,
      secret,
      setIsloading,
      user?.chain,
      user?.internetIdentity,
      user?.sessionKey,
    ],
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

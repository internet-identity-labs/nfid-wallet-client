import React from "react"
import { useParams } from "react-router-dom"

import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { AuthorizeApp } from "frontend/screens/authorize-app"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface AppScreenAuthorizeAppProps {
  isRemoteAuthorisation?: boolean
  redirectTo: string
}

export const AppScreenAuthorizeApp: React.FC<AppScreenAuthorizeAppProps> = ({
  redirectTo,
}) => {
  const { userNumber } = useAccount()
  const { isLoading, setIsloading } = useIsLoading()
  const { secret, scope } = useParams()
  const { nextPersonaId, accounts, createPersona } = usePersona()
  const { remoteNFIDLogin } = useAuthorizeApp()
  const { isAuthenticated, login } = useAuthentication()
  const { applicationName, applicationLogo } = useMultipass()

  const { authorizeApp, opener, authorizationRequest, postClientReadyMessage } =
    useAuthorization({
      userNumber,
    })

  const isNFID = React.useMemo(() => scope === "NFID", [scope])

  const handleNFIDLogin = React.useCallback(async () => {
    if (!secret) throw new Error("secret is missing from params")
    await remoteNFIDLogin({ secret })
    setIsloading(false)
  }, [remoteNFIDLogin, secret, setIsloading])

  React.useEffect(() => {
    if (!authorizationRequest && opener) {
      return postClientReadyMessage()
    }
  }, [authorizationRequest, opener, postClientReadyMessage])

  React.useEffect(() => {
    isNFID && isAuthenticated && handleNFIDLogin()
  }, [isNFID, isAuthenticated, handleNFIDLogin])

  const handleLogin = React.useCallback(
    async (personaId: string) => {
      setIsloading(true)
      await authorizeApp({ persona_id: personaId })
      setIsloading(false)
    },
    [authorizeApp, setIsloading],
  )

  const handleCreateAccountAndLogin = React.useCallback(async () => {
    setIsloading(true)
    const response = await createPersona({
      domain: scope || authorizationRequest?.hostname,
    })

    if (response?.status_code === 200) {
      return handleLogin(nextPersonaId)
    }
    setIsloading(false)
  }, [
    authorizationRequest?.hostname,
    createPersona,
    handleLogin,
    nextPersonaId,
    scope,
    setIsloading,
  ])

  return (
    <ScreenResponsive
      isLoading={isLoading}
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

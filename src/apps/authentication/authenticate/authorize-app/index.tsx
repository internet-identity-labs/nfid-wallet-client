import React from "react"
import { useParams } from "react-router-dom"

import { AuthorizeApp } from "frontend/design-system/pages/authorize-app"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAuthorization } from "frontend/apps/authorization/use-authorization"
import { useAuthorizeApp } from "frontend/apps/authorization/use-authorize-app"
import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { useApplicationConfig } from "frontend/comm/im"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"
import { usePersona } from "frontend/comm/services/identity-manager/persona/hooks"

interface AppScreenAuthorizeAppProps {
  isRemoteAuthorisation?: boolean
  redirectTo: string
}

export const AppScreenAuthorizeApp: React.FC<AppScreenAuthorizeAppProps> = ({
  redirectTo,
}) => {
  const { userNumber } = useAccount()
  const [isLoading, setLoading] = React.useState(true)
  const { secret, scope } = useParams()
  const { nextPersonaId, accounts, createPersona, getPersona } = usePersona()
  const { remoteNFIDLogin } = useAuthorizeApp()
  const { user, login } = useAuthentication()
  const { applicationName, applicationLogo } = useMultipass()

  const { authorizeApp, opener, authorizationRequest, postClientReadyMessage } =
    useAuthorization({
      userNumber,
    })
  const { application, isLoading: isLoadingApplications } =
    useApplicationConfig(authorizationRequest?.hostname)

  console.log(">> ", { application, isLoadingApplications })

  React.useEffect(() => {
    getPersona()
  }, [getPersona])

  const isNFID = React.useMemo(() => scope === "NFID", [scope])

  const handleNFIDLogin = React.useCallback(async () => {
    if (!secret) throw new Error("secret is missing from params")
    await remoteNFIDLogin({ secret })
    setLoading(false)
  }, [remoteNFIDLogin, secret, setLoading])

  React.useEffect(() => {
    if (!authorizationRequest && opener) {
      return postClientReadyMessage()
    }
  }, [authorizationRequest, opener, postClientReadyMessage])

  React.useEffect(() => {
    isNFID && user && handleNFIDLogin()
  }, [isNFID, user, handleNFIDLogin])

  const handleLogin = React.useCallback(
    async (personaId: string) => {
      setLoading(true)
      await authorizeApp({ persona_id: personaId })
      setLoading(false)
    },
    [authorizeApp, setLoading],
  )

  const handleCreateAccountAndLogin = React.useCallback(async () => {
    setLoading(true)
    const response = await createPersona({
      domain: scope || authorizationRequest?.hostname,
    })

    if (response?.status_code === 200) {
      return handleLogin(nextPersonaId)
    }
    setLoading(false)
  }, [
    authorizationRequest?.hostname,
    createPersona,
    handleLogin,
    nextPersonaId,
    scope,
    setLoading,
  ])

  const handleSingleAccountLogin = React.useCallback(() => {
    // If we already have an account for this application, we authorize with this account
    if (accounts.length > 0) {
      console.log(">> handleSingleAccountLogin", {
        personaId: accounts[0].persona_id,
      })

      handleLogin(accounts[0].persona_id)
    } else {
      // Otherwise we create an account and log in
      console.log(">> handleSingleAccountLogin create account and log in")
      handleCreateAccountAndLogin()
    }
  }, [accounts, handleCreateAccountAndLogin, handleLogin])

  // Determins application configuration
  React.useEffect(() => {
    if (application && application.userLimit === 1) {
      handleSingleAccountLogin()
    }

    if (application && application.userLimit > 1) {
      setLoading(false)
    }
  }, [application, handleSingleAccountLogin, isLoadingApplications, setLoading])

  return (
    <ScreenResponsive
      isLoading={isLoading || isLoadingApplications}
      loadingMessage={
        application?.userLimit === 1
          ? "Application allows only one account. Logging in..."
          : ""
      }
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

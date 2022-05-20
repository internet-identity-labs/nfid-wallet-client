import { Card, CardBody, Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Navigate, useParams } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { AuthWrapper } from "frontend/screens/auth-wrapper"
import { AuthorizeApp } from "frontend/screens/authorize-app"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { LoginSuccess } from "frontend/services/internet-identity/api-result-to-login-result"

import { ProfileConstants } from "../../profile/routes"

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
  const { nextPersonaId, nfidPersonas, createPersona } = usePersona()
  const { remoteNFIDLogin } = useAuthorizeApp()
  const { isAuthenticated } = useAuthentication()
  const { applicationName } = useMultipass()

  const { authorizeApp, opener, authorizationRequest, postClientReadyMessage } =
    useAuthorization({
      userNumber,
    })

  const isNFID = React.useMemo(() => scope === "NFID", [scope])

  const handleLoginResult = React.useCallback(
    async (res: LoginSuccess | void) => {
      if (res && res.tag === "ok") {
        setIsloading(true)
      }
    },
    [setIsloading],
  )

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
      await authorizeApp({ persona_id: personaId })
    },
    [authorizeApp],
  )

  const handleCreateAccountAndLogin = React.useCallback(async () => {
    const response = await createPersona({
      domain: scope || authorizationRequest?.hostname,
    })

    if (response?.status_code === 200) {
      return handleLogin(nextPersonaId)
    }
  }, [
    authorizationRequest?.hostname,
    createPersona,
    handleLogin,
    nextPersonaId,
    scope,
  ])

  return (
    <AuthWrapper redirectTo={redirectTo} onLoginSuccess={handleLoginResult}>
      <AppScreen isFocused>
        {isNFID ? (
          isLoading ? (
            <Loader isLoading={isLoading} />
          ) : (
            <Navigate
              to={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
            />
          )
        ) : (
          <main className={clsx("flex flex-1")}>
            <div className="container px-6 py-0 mx-auto sm:py-4">
              <Card className="grid grid-cols-12">
                <CardBody className="col-span-12 md:col-span-4">
                  <AuthorizeApp
                    isRemoteAuthorisation
                    applicationName={applicationName || ""}
                    onLogin={handleLogin}
                    onCreateAccount={handleCreateAccountAndLogin}
                    accounts={nfidPersonas}
                  />
                </CardBody>
              </Card>
            </div>
          </main>
        )}
      </AppScreen>
    </AuthWrapper>
  )
}

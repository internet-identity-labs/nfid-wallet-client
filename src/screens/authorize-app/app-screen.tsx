import { Card, CardBody, Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Navigate, useParams } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { AuthWrapper } from "frontend/screens/auth-wrapper"
import { AuthorizeApp } from "frontend/screens/authorize-app"
import { LoginSuccess } from "frontend/services/internet-identity/api-result-to-login-result"

import { ProfileConstants } from "../../flows/screens-app/profile/routes"

interface AppScreenAuthorizeAppProps {
  isRemoteAuthorisation?: boolean
  redirectTo: string
}

export const AppScreenAuthorizeApp: React.FC<AppScreenAuthorizeAppProps> = ({
  isRemoteAuthorisation,
  redirectTo,
}) => {
  const { isLoading, setIsloading } = useIsLoading()
  const { secret, scope } = useParams()
  const { remoteNFIDLogin } = useAuthorizeApp()
  const { isAuthenticated } = useAuthentication()

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
    isNFID && isAuthenticated && handleNFIDLogin()
  }, [isNFID, isAuthenticated, handleNFIDLogin])

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
                  <AuthorizeApp isRemoteAuthorisation={isRemoteAuthorisation} />
                </CardBody>
              </Card>
            </div>
          </main>
        )}
      </AppScreen>
    </AuthWrapper>
  )
}

import React from "react"
import { Navigate, Route } from "react-router-dom"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { AuthWrapper } from "frontend/screens/auth-wrapper"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { Loader } from "frontend/ui-kit/src"

import { IFrameAuthorizeApp } from "../authorize-app"
import { IFrameProfileConstants } from "../personalize/routes"
import { UnknownDeviceScreen } from "./login-unknown"

const AuthenticateDecider: React.FC = () => {
  const { isLoading, setIsloading } = useIsLoading(true)
  const { userNumber, account, readAccount } = useAccount()
  const { getPersona } = usePersona()
  const { isAuthenticated, identityManager } = useAuthentication()

  const handleLoadAccount = React.useCallback(async () => {
    await Promise.all([readAccount(identityManager, userNumber), getPersona()])
    setIsloading(false)
  }, [getPersona, identityManager, readAccount, setIsloading, userNumber])

  React.useEffect(() => {
    if (isAuthenticated) {
      handleLoadAccount()
    }
  }, [handleLoadAccount, isAuthenticated])

  return userNumber ? (
    <AuthWrapper iframe redirectTo="/">
      {isLoading ? (
        <IFrameScreen logo>
          <Loader isLoading={isLoading} iframe />
        </IFrameScreen>
      ) : account?.skipPersonalize ? (
        <IFrameAuthorizeApp />
      ) : (
        <Navigate
          to={`${IFrameProfileConstants.base}/${IFrameProfileConstants.personalize}`}
        />
      )}
    </AuthWrapper>
  ) : (
    <UnknownDeviceScreen />
  )
}

export const IFrameAuthenticateAccountConstants = {
  base: "/authenticate",
}

export const IFrameAuthenticateAccountRoutes = (
  <Route
    path={IFrameAuthenticateAccountConstants.base}
    element={<AuthenticateDecider />}
  />
)

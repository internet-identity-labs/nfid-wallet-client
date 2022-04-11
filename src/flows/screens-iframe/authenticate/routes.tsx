import { Loader } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
import { Navigate, Route } from "react-router-dom"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { AuthWrapper } from "frontend/screens/auth-wrapper"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

import { IFrameAuthorizeApp } from "../authorize-app"
import { IFrameProfileConstants } from "../personalize/routes"
import { UnknownDeviceScreen } from "./login-unknown"

const AuthenticateDecider = ({ iframe = true }: { iframe?: boolean }) => {
  const { isLoading, setIsloading } = useIsLoading(true)
  const { userNumber, account, readAccount } = useAccount()
  const { getPersona } = usePersona()
  const { isAuthenticated, isRemoteDelegate, identityManager } =
    useAuthentication()

  const handleLoadAccount = React.useCallback(async () => {
    if (!isRemoteDelegate) {
      await Promise.all([
        readAccount(identityManager, userNumber),
        getPersona(),
      ])
    }
    setIsloading(false)
  }, [
    getPersona,
    identityManager,
    isRemoteDelegate,
    readAccount,
    setIsloading,
    userNumber,
  ])

  React.useEffect(() => {
    if (isAuthenticated) {
      handleLoadAccount()
    }
  }, [handleLoadAccount, isAuthenticated])

  return userNumber ? (
    <AuthWrapper iframe={iframe} redirectTo="/">
      {isLoading ? (
        <IFrameScreen logo>
          <Loader isLoading={isLoading} iframe={iframe} />
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
    <UnknownDeviceScreen iframe={iframe} />
  )
}

export const IFrameAuthenticateAccountConstants = {
  base: "/iframe-authenticate",
}

export const IFrameAuthenticateAccountRoutes = (
  <Route
    path={IFrameAuthenticateAccountConstants.base}
    element={<AuthenticateDecider iframe />}
  />
)

export const AppScreenAuthenticateAccountConstants = {
  base: "/authenticate",
}

export const AppScreenAuthenticateAccountRoutes = (
  <Route
    path={AppScreenAuthenticateAccountConstants.base}
    element={<AuthenticateDecider iframe={false} />}
  />
)

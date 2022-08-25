import React from "react"
import { Navigate } from "react-router-dom"

import { AppScreenNFIDLogin } from "frontend/apps/authentication/authenticate/nfid-login"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

interface AuthWrapperProps {
  iframe?: boolean
  children?: React.ReactNode
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthentication()
  const { isLoading, error, profile } = useAccount()
  console.debug("AuthWrapper", {
    isAuthenticated,
    errorMessage: error && error.message,
    error,
  })

  if (isLoading) return <ScreenResponsive isLoading />
  // FIXME: within upcoming Profile refactor
  // when we're coming from profile which was authenticated via
  // google device and user has clicked log out
  // we're not able to retrieve account with unauthenticated actor.
  // For the time we're transitioning to
  if (
    !profile &&
    error &&
    error.message === "404 error: Unable to find Account"
  ) {
    return <Navigate to={"/"} />
  }

  return isAuthenticated ? <>{children}</> : <AppScreenNFIDLogin />
}

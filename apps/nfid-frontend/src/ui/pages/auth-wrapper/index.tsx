import React from "react"
import { Navigate } from "react-router-dom"

import { BlurredLoader } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"

interface AuthWrapperProps {
  iframe?: boolean
  children: JSX.Element | JSX.Element[]
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, cacheLoaded } = useAuthentication()

  console.debug("AuthWrapper", { isAuthenticated, cacheLoaded })

  switch (true) {
    case isAuthenticated:
      authState.checkAndRenewFEDelegation()
      return <>{children}</>

    case cacheLoaded && !isAuthenticated:
      return <Navigate to="/?auth=true" />
    default:
      return <BlurredLoader loadingMessage="loading auth session" />
  }
}

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
  const { isAuthenticated } = useAuthentication()

  authState.checkAndRenewFEDelegation()

  const { cacheLoaded } = authState.get()

  switch (true) {
    case !cacheLoaded:
      return <BlurredLoader loadingMessage="loading auth session" />
    case isAuthenticated:
      return <>{children}</>
    default:
      return <Navigate to="/" />
  }
}

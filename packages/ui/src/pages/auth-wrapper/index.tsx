import React from "react"
import { Navigate } from "react-router-dom"

import { BlurredLoader } from "@nfid/ui"
import { authState, isDelegationExpired } from "@nfid/integration"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"

interface AuthWrapperProps {
  iframe?: boolean
  children: JSX.Element | JSX.Element[]
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, cacheLoaded } = useAuthentication()

  switch (true) {
    case isAuthenticated: {
      const isExpired = isDelegationExpired(authState?.get().delegationIdentity)
      if (isExpired) return <Navigate to="/?auth=true" />
      return <>{children}</>
    }
    case cacheLoaded && !isAuthenticated:
      return <Navigate to="/?auth=true" />
    default:
      return <BlurredLoader loadingMessage="loading auth session" />
  }
}

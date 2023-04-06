import React from "react"
import { Navigate } from "react-router-dom"
import useSWRImmutable from "swr/immutable"

import { BlurredLoader } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"

interface AuthWrapperProps {
  iframe?: boolean
  children: JSX.Element | JSX.Element[]
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthentication()

  const { data } = useSWRImmutable("cachedAuthState", () =>
    authState.loadCachedAuthSession(),
  )

  switch (true) {
    case !data?.cacheLoaded:
      return <BlurredLoader loadingMessage="loading auth session" />
    case isAuthenticated:
      authState.checkAndRenewFEDelegation()
      return <>{children}</>
    default:
      return <Navigate to="/" />
  }
}

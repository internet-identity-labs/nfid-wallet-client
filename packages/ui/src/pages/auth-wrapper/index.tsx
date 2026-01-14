import React from "react"
import { Navigate } from "react-router-dom"

import { BlurredLoader } from "@nfid-frontend/ui"
import { authState, isDelegationExpired } from "@nfid/integration"

interface AuthWrapperProps {
  iframe?: boolean
  children: JSX.Element | JSX.Element[]
  isAuthenticated: boolean
  cacheLoaded: boolean
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  isAuthenticated,
  cacheLoaded,
}) => {
  console.debug("AuthWrapper", { isAuthenticated, cacheLoaded })

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

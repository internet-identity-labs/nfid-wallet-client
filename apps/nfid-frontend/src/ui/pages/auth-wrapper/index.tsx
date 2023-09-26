import React from "react"
import { useNavigate } from "react-router-dom"

import { BlurredLoader } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { NFIDAuthentication } from "frontend/apps/marketing/landing-page/auth-modal"

interface AuthWrapperProps {
  iframe?: boolean
  children: JSX.Element | JSX.Element[]
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, cacheLoaded } = useAuthentication()
  const navigate = useNavigate()

  console.debug("AuthWrapper", { isAuthenticated, cacheLoaded })

  switch (true) {
    case isAuthenticated:
      authState.checkAndRenewFEDelegation()
      return <>{children}</>

    case cacheLoaded && !isAuthenticated:
      return (
        <>
          {children}
          <NFIDAuthentication isVisible={true} onClose={() => navigate("/")} />
        </>
      )

    default:
      return <BlurredLoader loadingMessage="loading auth session" />
  }
}

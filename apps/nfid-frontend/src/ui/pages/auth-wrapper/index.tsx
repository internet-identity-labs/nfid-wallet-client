import React from "react"
import { Navigate } from "react-router-dom"
import useSWRImmutable from "swr/immutable"

import { BlurredLoader } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

interface AuthWrapperProps {
  iframe?: boolean
  children: JSX.Element | JSX.Element[]
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { data } = useSWRImmutable("cachedAuthState", () =>
    authState.loadCachedAuthSession(),
  )

  switch (true) {
    case !!data?.delegationIdentity:
      authState.checkAndRenewFEDelegation()
      return <>{children}</>

    case data?.cacheLoaded && !data.delegationIdentity:
      return <Navigate to="/" />

    default:
      return <BlurredLoader loadingMessage="loading auth session" />
  }
}

import { Principal } from "@dfinity/principal"
import validate, { Network } from "bitcoin-address-validation"
import { isAddress } from "ethers"
import React from "react"
import { Navigate } from "react-router-dom"

import { BlurredLoader } from "@nfid-frontend/ui"
import { authState, isDelegationExpired } from "@nfid/integration"

function isValidViewOnlyAddress(address: string): boolean {
  if (isAddress(address)) return true
  if (validate(address, Network.mainnet)) return true
  try {
    Principal.fromText(address)
    return true
  } catch {}
  return false
}

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

  const searchParams = new URLSearchParams(window.location.search)
  const viewOnlyParam = searchParams.get("viewOnly")
  if (searchParams.has("viewOnly") && !viewOnlyParam)
    return <Navigate to="/not-found" />
  if (viewOnlyParam) {
    if (!isValidViewOnlyAddress(viewOnlyParam))
      return <Navigate to="/not-found" />
    return <>{children}</>
  }

  switch (true) {
    case isAuthenticated: {
      const isExpired = isDelegationExpired(authState?.get().delegationIdentity)
      if (isExpired) return <Navigate to="/" />
      return <>{children}</>
    }
    case cacheLoaded && !isAuthenticated:
      return <Navigate to="/" />
    default:
      return <BlurredLoader loadingMessage="loading auth session" />
  }
}

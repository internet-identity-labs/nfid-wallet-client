import React from "react"
import { useNavigate } from "react-router-dom"

import { AppScreenNFIDLogin } from "frontend/apps/authentication/authenticate/nfid-login"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { loadProfileFromLocalStorage } from "frontend/integration/identity-manager/profile"

interface AuthWrapperProps {
  iframe?: boolean
  children?: React.ReactNode
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthentication()
  const navigate = useNavigate()

  const profile = React.useMemo(() => loadProfileFromLocalStorage(), [])
  if (!isAuthenticated && !profile) navigate("/")

  return isAuthenticated ? <>{children}</> : <AppScreenNFIDLogin />
}

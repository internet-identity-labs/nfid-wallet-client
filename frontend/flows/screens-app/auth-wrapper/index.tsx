import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"
import { Navigate } from "react-router-dom"
import { AuthenticateNFIDLogin } from "../authenticate/login"

interface AuthWrapper {
  redirectTo: string
}
export const AuthWrapper: React.FC<AuthWrapper> = ({
  children,
  redirectTo,
}) => {
  const { isAuthenticated } = useAuthentication()
  const { account } = useAccount()

  return isAuthenticated ? (
    <>{children}</>
  ) : account ? (
    <AuthenticateNFIDLogin />
  ) : (
    <Navigate to={redirectTo} />
  )
}

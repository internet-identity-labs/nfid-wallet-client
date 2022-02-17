import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"
import { Navigate, useParams } from "react-router-dom"
import { AuthenticateNFIDLogin } from "../authenticate"

interface AuthWrapper {
  redirectTo: string
}
export const AuthWrapper: React.FC<AuthWrapper> = ({
  children,
  redirectTo,
}) => {
  const { isAuthenticated, login } = useAuthentication()
  const { secret, scope } = useParams()
  const { account } = useAccount()

  return isAuthenticated ? (
    <>{children}</>
  ) : account ? (
    <AuthenticateNFIDLogin onLogin={login} />
  ) : (
    <Navigate to={redirectTo} />
  )
}

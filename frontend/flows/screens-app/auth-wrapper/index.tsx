import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"
import { generatePath, Navigate, useParams } from "react-router-dom"
import { AuthenticateNFIDLogin } from "../authenticate/login"

interface AuthWrapper {
  redirectTo: string
}
export const AuthWrapper: React.FC<AuthWrapper> = ({
  children,
  redirectTo,
}) => {
  const params = useParams()
  const { isAuthenticated } = useAuthentication()
  const { account } = useAccount()

  return isAuthenticated ? (
    <>{children}</>
  ) : account ? (
    <AuthenticateNFIDLogin />
  ) : (
    <Navigate to={generatePath(redirectTo, params)} />
  )
}

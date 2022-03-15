import React from "react"
import { generatePath, Navigate, useParams } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { AuthenticateNFIDLogin } from "../authenticate/login"

interface AuthWrapperProps {
  redirectTo: string
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  redirectTo,
}) => {
  const params = useParams()
  console.log(">> AuthWrapper", { params })

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

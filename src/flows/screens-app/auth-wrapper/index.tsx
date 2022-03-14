import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"
import { generatePath, Navigate, useParams } from "react-router-dom"
import { AuthenticateNFIDLogin } from "../authenticate/login"

interface AuthWrapperProps {
  redirectTo: string
  iframe?: boolean
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  redirectTo,
  iframe,
}) => {
  const params = useParams()
  console.log(">> AuthWrapper", { params })

  const { isAuthenticated } = useAuthentication()
  const { account } = useAccount()

  return isAuthenticated ? (
    <>{children}</>
  ) : account ? (
    <AuthenticateNFIDLogin iframe={iframe} />
  ) : (
    <Navigate to={generatePath(redirectTo, params)} />
  )
}

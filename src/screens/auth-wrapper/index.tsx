import React from "react"
import { generatePath, Navigate, useParams } from "react-router-dom"

import { AppScreenNFIDLogin } from "frontend/flows/screens-app/authenticate/nfid-login"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface AuthWrapperProps {
  redirectTo: string
  iframe?: boolean
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  redirectTo,
}) => {
  const params = useParams()

  const { user } = useAuthentication()
  const { account } = useAccount()

  return user ? (
    <>{children}</>
  ) : account ? (
    <AppScreenNFIDLogin />
  ) : (
    <Navigate to={generatePath(redirectTo, params)} />
  )
}

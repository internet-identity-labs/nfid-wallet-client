import React from "react"
import { generatePath, Navigate, useParams } from "react-router-dom"

import { AppScreenNFIDLogin } from "frontend/flows/screens-app/authenticate/login"
import { IFrameNFIDLogin } from "frontend/flows/screens-iframe/authenticate/login"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

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

  const { isAuthenticated } = useAuthentication()
  const { account } = useAccount()

  return isAuthenticated ? (
    <>{children}</>
  ) : account ? (
    <NFIDLoginDecider iframe={iframe} />
  ) : (
    <Navigate to={generatePath(redirectTo, params)} />
  )
}

const NFIDLoginDecider: React.FC<{ iframe?: boolean }> = ({ iframe }) =>
  iframe ? <IFrameNFIDLogin /> : <AppScreenNFIDLogin />

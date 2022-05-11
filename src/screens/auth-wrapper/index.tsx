import React from "react"
import { generatePath, Navigate, useParams } from "react-router-dom"

import { AppScreenNFIDLogin } from "frontend/flows/screens-app/authenticate/login"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { IFrameNFIDLogin } from "frontend/screens/nfid-login/screen-iframe"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { LoginSuccess } from "frontend/services/internet-identity/api-result-to-login-result"

interface AuthWrapperProps {
  redirectTo: string
  iframe?: boolean
  onLoginSuccess?: (loginResult: void | LoginSuccess) => void
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  redirectTo,
  iframe,
  onLoginSuccess,
}) => {
  const params = useParams()

  const { isAuthenticated } = useAuthentication()
  const { account } = useAccount()

  return isAuthenticated ? (
    <>{children}</>
  ) : account ? (
    <NFIDLoginDecider iframe={iframe} onLoginSuccess={onLoginSuccess} />
  ) : (
    <Navigate to={generatePath(redirectTo, params)} />
  )
}

const NFIDLoginDecider: React.FC<{
  iframe?: boolean
  onLoginSuccess?: (loginResult: void | LoginSuccess) => void
}> = ({ iframe, onLoginSuccess }) =>
  iframe ? (
    <IFrameNFIDLogin onLoginSuccess={onLoginSuccess} />
  ) : (
    <AppScreenNFIDLogin onLoginSuccess={onLoginSuccess} />
  )

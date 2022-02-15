import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"
import { Navigate } from "react-router-dom"
import { AuthenticateNFIDLogin } from "../authenticate"
import { RegisterAccountConstants as RAC } from "../register-account/routes"

export const AuthWrapper: React.FC = ({ children }) => {
  const { isAuthenticated, login } = useAuthentication()
  const { account } = useAccount()

  return isAuthenticated ? (
    <>{children}</>
  ) : account ? (
    <AuthenticateNFIDLogin onLogin={login} />
  ) : (
    <Navigate to={`${RAC.base}/${RAC.account}`} />
  )
}

import React from "react"
import { Navigate } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"

interface AuthWrapperProps {
  iframe?: boolean
  children: JSX.Element | JSX.Element[]
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthentication()

  return isAuthenticated ? <>{children}</>: <Navigate to="/"/>
}

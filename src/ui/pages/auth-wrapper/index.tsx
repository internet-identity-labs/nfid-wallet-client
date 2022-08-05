import React from "react"

import { AppScreenNFIDLogin } from "frontend/apps/authentication/authenticate/nfid-login"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

interface AuthWrapperProps {
  iframe?: boolean
  children?: React.ReactNode
}
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthentication()
  const { isLoading } = useAccount()
  console.debug("AuthWrapper", { isAuthenticated })

  if (isLoading) return <ScreenResponsive isLoading />

  return isAuthenticated ? <>{children}</> : <AppScreenNFIDLogin />
}

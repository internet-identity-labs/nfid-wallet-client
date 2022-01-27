import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"
import { Route } from "react-router-dom"
import { Authenticate } from "."
import { UnknownDeviceScreen } from "../login-unknown"

export const AuthenticateConstants = {
  base: "/authenticate",
}

const AuthenticateDecider: React.FC = () => {
  const { userNumber } = useAccount()

  return userNumber ? (
    <Authenticate userNumber={userNumber} />
  ) : (
    <UnknownDeviceScreen />
  )
}

export const AuthenticateRoutes = (
  <Route path={AuthenticateConstants.base} element={<AuthenticateDecider />} />
)

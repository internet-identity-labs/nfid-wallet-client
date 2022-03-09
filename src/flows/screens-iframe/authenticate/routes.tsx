import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"
import { Route } from "react-router-dom"
import { IFrameAuthenticateNFIDLogin } from "./login"
import { UnknownDeviceScreen } from "./login-unknown"

const AuthenticateDecider: React.FC = () => {
  const { userNumber } = useAccount()

  return userNumber ? <IFrameAuthenticateNFIDLogin /> : <UnknownDeviceScreen />
}

export const IFrameAuthenticateAccountConstants = {
  base: "/authenticate",
}

export const IFrameAuthenticateAccountRoutes = (
  <Route
    path={IFrameAuthenticateAccountConstants.base}
    element={<AuthenticateDecider />}
  />
)

import { Route } from "react-router-dom"

import { VerifyPhoneNumberRoute } from "./router"

export const RemoteNFIDAuthenticationConstants = {
  authorize: "/remote-nfid-authentication/:secret/:scope",
}

export const RemoteNFIDAuthenticationRoutes = (
  <Route
    path={RemoteNFIDAuthenticationConstants.authorize}
    element={<VerifyPhoneNumberRoute />}
  />
)

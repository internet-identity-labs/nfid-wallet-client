import { Route } from "react-router-dom"

import { AuthorizeNFID } from "./authorize"

export const RemoteNFIDAuthenticationConstants = {
  authorize: "/remote-nfid-authentication/:secret",
}

export const RemoteNFIDAuthenticationRoutes = (
  <Route
    path={RemoteNFIDAuthenticationConstants.authorize}
    element={<AuthorizeNFID />}
  />
)

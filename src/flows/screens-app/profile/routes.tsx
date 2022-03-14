import React from "react"
import { Outlet, Route } from "react-router-dom"
import { AuthenticateNFIDHome } from "."
import { AuthWrapper } from "frontend/screens/auth-wrapper"
import { NFIDPersonalize } from "./personalize"

export const ProfileConstants = {
  base: "/profile",
  authenticate: "authenticate",
  personalize: "personalize",
}

export const ProfileRoutes = (
  <Route path={ProfileConstants.base} element={<Outlet />}>
    <Route
      path={ProfileConstants.authenticate}
      element={
        // TODO: redirect to general register flow
        <AuthWrapper redirectTo="/">
          <AuthenticateNFIDHome />
        </AuthWrapper>
      }
    />
    <Route path={ProfileConstants.personalize} element={<NFIDPersonalize />} />
  </Route>
)

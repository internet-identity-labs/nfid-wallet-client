import React from "react"
import { Outlet, Route } from "react-router-dom"
import { AuthenticateNFIDHome } from "."
import { AuthWrapper } from "../auth-wrapper"
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
        <AuthWrapper redirectTo="/">
          <AuthenticateNFIDHome />
        </AuthWrapper>
      }
    />
    <Route path={ProfileConstants.personalize} element={<NFIDPersonalize />} />
  </Route>
)

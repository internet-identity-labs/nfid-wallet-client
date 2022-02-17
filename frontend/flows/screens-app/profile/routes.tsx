import React from "react"
import { Route } from "react-router-dom"
import { AuthenticateNFIDHome } from "."
import { AuthWrapper } from "../auth-wrapper"

export const ProfileConstants = {
  profile: "/profile",
}

export const ProfileRoutes = (
  <Route
    path={ProfileConstants.profile}
    element={
      <AuthWrapper redirectTo="/">
        <AuthenticateNFIDHome />
      </AuthWrapper>
    }
  />
)

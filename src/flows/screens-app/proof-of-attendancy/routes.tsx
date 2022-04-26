import React from "react"
import { Route } from "react-router-dom"

import { AuthWrapper } from "frontend/screens/auth-wrapper"

import { AppScreenAuthorizeApp } from "../authorize-app"

export const AppScreenProofOfAttendencyConstants = {
  base: "/poa/:secret",
}

export const AppScreenProofOfAttendencyRoutes = (redirectTo: string) => (
  <Route
    path={AppScreenProofOfAttendencyConstants.base}
    element={
      <AuthWrapper redirectTo={redirectTo}>
        <AppScreenAuthorizeApp />
      </AuthWrapper>
    }
  />
)

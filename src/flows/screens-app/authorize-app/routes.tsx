import React from "react"
import { Route } from "react-router-dom"

import { AuthWrapper } from "frontend/screens/auth-wrapper"

import { AppScreenAuthorizeApp } from "."

export const AppScreenAuthorizeAppConstants = {
  base: "/rdp",
  authorize: ":secret/:scope/:applicationName",
}

export const AppScreenAuthorizeAppRoutes = (redirectTo: string) => (
  <Route path={AppScreenAuthorizeAppConstants.base}>
    <Route
      path={AppScreenAuthorizeAppConstants.authorize}
      element={
        <AuthWrapper redirectTo={redirectTo}>
          <AppScreenAuthorizeApp />
        </AuthWrapper>
      }
    />
  </Route>
)

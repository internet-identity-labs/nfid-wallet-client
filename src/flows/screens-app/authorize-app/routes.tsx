import React from "react"
import { Route } from "react-router-dom"
import { AppScreenAuthorizeApp } from "."
import { AuthWrapper } from "../auth-wrapper"

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

import React from "react"
import { Route } from "react-router-dom"

import { AppScreenAuthorizeApp } from "frontend/screens/authorize-app/app-screen"

export const AppScreenAuthorizeAppConstants = {
  base: "/rdp",
  authorize: ":secret/:scope/:applicationName",
}

export const AppScreenAuthorizeAppRoutes = (redirectTo: string) => (
  <Route path={AppScreenAuthorizeAppConstants.base}>
    <Route
      path={AppScreenAuthorizeAppConstants.authorize}
      element={
        <AppScreenAuthorizeApp isRemoteAuthorisation redirectTo={redirectTo} />
      }
    />
  </Route>
)

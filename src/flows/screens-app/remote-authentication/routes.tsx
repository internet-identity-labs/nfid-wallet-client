import React from "react"
import { Route } from "react-router-dom"

import { AppScreenAuthorizeApp } from "frontend/flows/screens-app/remote-authentication/authorize-app"

export const AppScreenAuthorizeAppConstants = {
  authorize: "/rdp/:secret/:scope/:applicationName",
}

export const AppScreenAuthorizeAppRoutes = (
  <Route
    path={AppScreenAuthorizeAppConstants.authorize}
    element={<AppScreenAuthorizeApp />}
  />
)

import React from "react"
import { Route } from "react-router-dom"

import { AppScreenAuthorizeApp } from "frontend/apps/authentication/remote-authentication/authorize-app"

export const AppScreenAuthorizeAppConstants = {
  authorize: "/rdp/:secret/:scope",
}

export const AppScreenAuthorizeAppRoutes = (
  <Route
    path={AppScreenAuthorizeAppConstants.authorize}
    element={<AppScreenAuthorizeApp />}
  />
)

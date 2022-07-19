import React from "react"
import { Route } from "react-router-dom"

import { AppScreenAuthorizeApp } from "frontend/apps/authentication/remote-authentication/authorize-app"

const authorizeBase = "/rdp/:secret/:scope"

export const AppScreenAuthorizeAppConstants = {
  authorize: authorizeBase,
  authorizeDerivationOrigin: `${authorizeBase}/:derivationOrigin`,
}

export const AppScreenAuthorizeAppRoutes = (
  <Route
    path={AppScreenAuthorizeAppConstants.authorize}
    element={<AppScreenAuthorizeApp />}
  />
)
export const AppScreenAuthorizeDerivationOriginAppRoutes = (
  <Route
    path={AppScreenAuthorizeAppConstants.authorizeDerivationOrigin}
    element={<AppScreenAuthorizeApp />}
  />
)

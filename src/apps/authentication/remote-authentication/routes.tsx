import React from "react"
import { generatePath, Route } from "react-router-dom"

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

export function remoteReceiverUrl({
  domain,
  secret,
  applicationName,
  applicationLogo,
  applicationDerivationOrigin,
}: {
  domain: string
  secret: string
  applicationName?: string
  applicationLogo?: string
  applicationDerivationOrigin?: string
}) {
  const query = new URLSearchParams({
    applicationName: applicationName || "",
    applicationLogo: encodeURIComponent(applicationLogo || ""),
  }).toString()

  const path = generatePath("/remote-idp", {
    secret,
    scope: domain,
    ...(applicationDerivationOrigin
      ? { derivationOrigin: applicationDerivationOrigin }
      : {}),
  })

  return `${window.location.origin}${path}?${query.toString()}`
}

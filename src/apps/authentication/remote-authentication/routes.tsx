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

export function remoteReceiverUrl({
  domain,
  secret,
  maxTimeToLive = BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
  applicationName,
  applicationLogo,
  applicationDerivationOrigin,
}: {
  domain: string | undefined
  secret: string
  maxTimeToLive?: bigint
  applicationName?: string
  applicationLogo?: string
  applicationDerivationOrigin?: string
}) {
  const query = new URLSearchParams({
    secret,
    scope: domain || "",
    derivationOrigin: applicationDerivationOrigin || "",
    maxTimeToLive: maxTimeToLive.toString() || "",
    applicationName: applicationName || "",
    applicationLogo: encodeURIComponent(applicationLogo || ""),
  }).toString()

  const path = `/ridp/`
  console.debug(remoteReceiverUrl.name, {
    path: encodeURI(`${path}?${query.toString()}`),
  })

  return `${window.location.origin}${path}?${query.toString()}`
}

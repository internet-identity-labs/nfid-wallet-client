import { urlEncode } from "@sentry/utils"
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
  maxTimeToLive = BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
  applicationName,
  applicationLogo,
  applicationDerivationOrigin,
}: {
  domain: string
  secret: string
  maxTimeToLive?: bigint
  applicationName?: string
  applicationLogo?: string
  applicationDerivationOrigin?: string
}) {
  const query = new URLSearchParams({
    applicationName: applicationName || "",
    applicationLogo: encodeURIComponent(applicationLogo || ""),
  }).toString()

  const pathPattern = applicationDerivationOrigin
    ? "/ridp/:secret/:maxTimeToLive/:scope/:derivationOrigin"
    : "/ridp/:secret/:maxTimeToLive/:scope"

  const path = generatePath(pathPattern, {
    secret,
    scope: domain.replace(/https?:\/\//, ""),
    maxTimeToLive: maxTimeToLive.toString(),
    ...(applicationDerivationOrigin
      ? { derivationOrigin: encodeURI(applicationDerivationOrigin) }
      : {}),
  })
  console.debug(remoteReceiverUrl.name, { path: encodeURI(path) })

  return `${window.location.origin}${path}?${query.toString()}`
}

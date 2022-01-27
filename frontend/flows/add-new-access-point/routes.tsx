import React from "react"
import { Outlet, Route } from "react-router-dom"
import { AuthWrapper } from "../auth-wrapper"
import { AwaitingConfirmation } from "./awaiting-confirmation"
import { CopyLinkToChannel } from "./copy-link-to-channel"
import { CreateKeysScreen } from "./create-keys"

export const AccessPointConstants = {
  base: "/new-access-point",
  copyLinkToChannel: "copy-link-to-channel",
  awaitingConfirmation: "awaiting-confirmation",
  createKeys: "create-keys",
}

export const AccessPointRoutes = (
  <Route path={AccessPointConstants.base} element={<Outlet />}>
    <Route
      path={AccessPointConstants.copyLinkToChannel}
      element={
        <AuthWrapper>
          <CopyLinkToChannel />
        </AuthWrapper>
      }
    />
    <Route
      path={AccessPointConstants.awaitingConfirmation}
      element={<AwaitingConfirmation />}
    />
    <Route
      path={`${AccessPointConstants.createKeys}/:secret`}
      element={<CreateKeysScreen />}
    />
  </Route>
)

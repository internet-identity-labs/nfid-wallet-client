import React from "react"
import { Outlet } from "react-router"
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

export const AccessPointRoutes = {
  path: AccessPointConstants.base,
  element: <Outlet />,
  children: [
    {
      path: AccessPointConstants.copyLinkToChannel,
      element: (
        <AuthWrapper>
          <CopyLinkToChannel />
        </AuthWrapper>
      ),
    },
    {
      path: AccessPointConstants.awaitingConfirmation,
      element: <AwaitingConfirmation />,
    },
    {
      path: `${AccessPointConstants.createKeys}/:secret`,
      element: <CreateKeysScreen />,
    },
  ],
}

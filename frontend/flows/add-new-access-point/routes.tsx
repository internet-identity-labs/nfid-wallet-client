import React from "react"
import { Outlet } from "react-router"
import { AuthWrapper } from "../auth-wrapper"
import { AwaitingConfirmation } from "./awaiting-confirmation"
import { CopyLinkToChannel } from "./copy-link-to-channel"
import { CreateKeysScreen } from "./create-keys"

export const CONSTANTS = {
  base: "new-access-point",
  copyLinkToChannel: "copy-link-to-channel",
  awaitingConfirmation: "awaiting-confirmation",
  createKeys: "create-keys",
}

export const AccessPointRoutes = {
  path: CONSTANTS.base,
  element: <Outlet />,
  children: [
    {
      path: CONSTANTS.copyLinkToChannel,
      element: (
        <AuthWrapper>
          <CopyLinkToChannel />
        </AuthWrapper>
      ),
    },
    { path: CONSTANTS.awaitingConfirmation, element: <AwaitingConfirmation /> },
    { path: `${CONSTANTS.createKeys}/:secret`, element: <CreateKeysScreen /> },
  ],
}

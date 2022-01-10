import React from "react"
import { UnknownDeviceScreen } from "./login-unknown"

export const IFrameConstants = {
  base: "/login-unknown-device",
}

export const IFrameRoutes = {
  path: IFrameConstants.base,
  element: <UnknownDeviceScreen />,
}

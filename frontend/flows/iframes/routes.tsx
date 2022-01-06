import React from "react"
import { UnknownDeviceScreen } from "./login-unknown"

export const CONSTANTS = {
  base: "login-unknown-device",
}

export const IFrameRoutes = {
  path: CONSTANTS.base,
  element: <UnknownDeviceScreen />,
}

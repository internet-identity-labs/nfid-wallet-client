import React from "react"
import { Route } from "react-router-dom"
import { UnknownDeviceScreen } from "./login-unknown"

export const IFrameConstants = {
  base: "/login-unknown-device",
}

export const IFrameRoutes = (
  <Route path={IFrameConstants.base} element={<UnknownDeviceScreen />} />
)

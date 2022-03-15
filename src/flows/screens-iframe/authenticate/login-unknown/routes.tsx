import React from "react"
import { Route } from "react-router-dom"

import { UnknownDeviceScreen } from "."

export const IFrameUnknownDeviceConstants = {
  base: "/login-unknown-device-iframe",
}

export const IFrameUnknownDeviceRoutes = (
  <Route
    path={IFrameUnknownDeviceConstants.base}
    element={<UnknownDeviceScreen />}
  />
)

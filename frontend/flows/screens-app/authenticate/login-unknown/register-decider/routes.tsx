import React from "react"
import { Route } from "react-router-dom"
import { AuthorizeRegisterDecider } from "."

export const UnknownDeviceConstants = {
  base: "/login-unknown-device",
}

export const UnknownDeviceRoutes = (
  <Route
    path={UnknownDeviceConstants.base}
    element={<AuthorizeRegisterDecider />}
  />
)

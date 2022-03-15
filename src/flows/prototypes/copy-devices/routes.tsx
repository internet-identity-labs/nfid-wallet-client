import React from "react"
import { Route } from "react-router-dom"

import { CopyDevices } from "."

export const CopyDevicesConstants = {
  base: "/copy-devices",
}

export const CopyDevicesRoutes = (
  <Route path={CopyDevicesConstants.base} element={<CopyDevices />} />
)

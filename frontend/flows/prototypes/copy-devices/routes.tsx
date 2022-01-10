import React from "react"
import { CopyDevices } from "."

export const CopyDevicesConstants = {
  base: "/copy-devices",
}

export const CopyDevicesRoutes = {
  path: CopyDevicesConstants.base,
  element: <CopyDevices />,
}

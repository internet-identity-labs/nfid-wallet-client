import React from "react"
import { Outlet, Route } from "react-router-dom"

import { IFrameRestoreAccessPointStart } from "."
import { IFrameRegisterDeviceDecider } from "../../../screens/register-device-decider/screen-iframe"

export const IFrameRecoverNFIDConstants = {
  base: "/recover-nfid-iframe",
  options: "options",
  recoveryPhrase: "recovery-phrase",
  registerDevice: "register-device",
}

export const IFrameRecoverNFIDRoutes = (
  <Route path={IFrameRecoverNFIDConstants.base} element={<Outlet />}>
    <Route
      path={IFrameRecoverNFIDConstants.options}
      element={<IFrameRestoreAccessPointStart />}
    />
    <Route
      path={IFrameRecoverNFIDConstants.registerDevice}
      element={<IFrameRegisterDeviceDecider />}
    />
  </Route>
)

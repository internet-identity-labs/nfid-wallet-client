import React from "react"
import { Outlet, Route } from "react-router-dom"

import { AppScreenRegisterDevice } from "frontend/screens/register-device-decider/screen-app"

import { AppScreenRecoverNFID } from "../../../screens/recover-nfid/screen-app"

export const RecoverNFIDRoutesConstants = {
  base: "/recover-nfid",
  enterSeedPhrase: "enter-seed-phrase",
  registerDevice: "register-device",
}

export const RecoverNFIDRoutes = (
  <Route path={RecoverNFIDRoutesConstants.base} element={<Outlet />}>
    <Route
      path={RecoverNFIDRoutesConstants.enterSeedPhrase}
      element={
        <AppScreenRecoverNFID
          registerDeviceDeciderPath={`${RecoverNFIDRoutesConstants.base}/${RecoverNFIDRoutesConstants.registerDevice}`}
        />
      }
    />
    <Route
      path={RecoverNFIDRoutesConstants.registerDevice}
      element={
        <AppScreenRegisterDevice
          loginSuccessPath={"/"}
          registerDeviceSuccessPath={"/"}
        />
      }
    />
  </Route>
)

import React from "react"
import { Outlet, Route } from "react-router-dom"

import { AppScreenRegisterDevice } from "frontend/flows/screens-app/authenticate/screen-app-register-device-decider"

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
      element={<AppScreenRegisterDevice />}
    />
  </Route>
)

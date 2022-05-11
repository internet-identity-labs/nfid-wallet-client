import React from "react"
import { Outlet, Route } from "react-router-dom"

import { AppScreenRecoverNFID } from "../../../screens/recover-nfid/screen-app"
import { ProfileConstants } from "../profile/routes"
import { AppScreenRegisterDevice } from "./register-device"

export const RecoverNFIDRoutesConstants = {
  base: "/recover-nfid",
  enterRecoveryPhrase: "enter-recovery-phrase",
  registerDevice: "register-device",
}

export const RecoverNFIDRoutes = (
  <Route path={RecoverNFIDRoutesConstants.base} element={<Outlet />}>
    <Route
      path={RecoverNFIDRoutesConstants.enterRecoveryPhrase}
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
          registerSuccessPath={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
        />
      }
    />
  </Route>
)

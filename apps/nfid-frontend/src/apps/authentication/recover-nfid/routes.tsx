import React from "react"
import { Outlet, Route } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

const AppScreenRecoverNFID = React.lazy(() => import("."))
const RouterRegisterDeviceDecider = React.lazy(
  () => import("../../device/register-device-decider"),
)

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
          registerDeviceDeciderPath={ProfileConstants.security}
        />
      }
    />
    <Route
      path={RecoverNFIDRoutesConstants.registerDevice}
      element={
        <RouterRegisterDeviceDecider
          registerSuccessPath={"/profile/security"}
        />
      }
    />
  </Route>
)

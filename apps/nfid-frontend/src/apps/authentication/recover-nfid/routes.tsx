import React from "react"
import { Outlet, Route } from "react-router-dom"

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
        <React.Suspense fallback={<div>Loading...</div>}>
          <AppScreenRecoverNFID
            registerDeviceDeciderPath={`${RecoverNFIDRoutesConstants.base}/${RecoverNFIDRoutesConstants.registerDevice}`}
          />
        </React.Suspense>
      }
    />
    <Route
      path={RecoverNFIDRoutesConstants.registerDevice}
      element={
        <React.Suspense fallback={<div>Loading...</div>}>
          <RouterRegisterDeviceDecider
            registerSuccessPath={"/profile/security"}
          />
        </React.Suspense>
      }
    />
  </Route>
)

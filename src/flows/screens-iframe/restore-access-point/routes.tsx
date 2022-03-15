import React from "react"
import { Outlet, Route } from "react-router-dom"

import { IFrameRestoreAccessPointStart } from "."
import { IFrameRestoreAccessPointRecoveryPhrase } from "./recovery-phrase"

export const IFrameRestoreAccessPointConstants = {
  base: "/restore-access-point-iframe",
  nfid: "nfid",
  recoveryPhrase: "recovery-phrase",
}

export const IFrameRestoreAccessPointRoutes = (
  <Route path={IFrameRestoreAccessPointConstants.base} element={<Outlet />}>
    <Route
      path={IFrameRestoreAccessPointConstants.nfid}
      element={<IFrameRestoreAccessPointStart />}
    />
    <Route
      path={IFrameRestoreAccessPointConstants.recoveryPhrase}
      element={<IFrameRestoreAccessPointRecoveryPhrase />}
    />
  </Route>
)

import React from "react"
import { Outlet, Route } from "react-router-dom"
import { RestoreAccessPointRecoveryPhrase } from "./recovery-phrase"

export const RestoreAccessPointConstants = {
  base: "/restore-account",
  recoveryPhrase: "recovery-phrase",
}

export const RestoreAccessPointRoutes = (
  <Route path={RestoreAccessPointConstants.base} element={<Outlet />}>
    <Route
      path={RestoreAccessPointConstants.recoveryPhrase}
      element={<RestoreAccessPointRecoveryPhrase />}
    />
  </Route>
)

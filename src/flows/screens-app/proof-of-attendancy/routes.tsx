import React from "react"
import { Route } from "react-router-dom"

import { ClaimAttendency } from "./register-or-claim"

export const AppScreenProofOfAttendencyConstants = {
  base: "/poa/:secret",
}

export const AppScreenProofOfAttendencyRoutes = (redirectTo: string) => (
  <Route
    path={AppScreenProofOfAttendencyConstants.base}
    element={<ClaimAttendency />}
  />
)

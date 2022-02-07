import React from "react"
import { Route } from "react-router-dom"
import { IFrameRestoreAccessPointStart } from "."

export const IFrameRestoreAccessPointConstants = {
  base: "/restore-account",
}

export const IFrameRestoreAccessPointRoutes = (
  <Route
    path={IFrameRestoreAccessPointConstants.base}
    element={<IFrameRestoreAccessPointStart />}
  />
)

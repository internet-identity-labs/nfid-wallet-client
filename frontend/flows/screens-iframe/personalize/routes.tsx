import React from "react"
import { Outlet, Route } from "react-router-dom"
import { IFrameNFIDPersonalize } from "."

export const IFrameProfileConstants = {
  base: "/profile-iframe",
  personalize: "personalize",
}

export const IFrameProfileRoutes = (
  <Route path={IFrameProfileConstants.base} element={<Outlet />}>
    <Route
      path={IFrameProfileConstants.personalize}
      element={<IFrameNFIDPersonalize />}
    />
  </Route>
)

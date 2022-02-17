import React from "react"
import { Outlet, Route } from "react-router-dom"
import { IFrameOverview } from "./iframe-overview"
import { KitchenSink } from "./kitchen-sink"

export const DevScreensConstants = {
  base: "/dev",
  kitchenSink: "kitchen-sink",
  iframeOverview: "iframe-overview",
}

export const DevScreensRoutes = (
  <Route path={DevScreensConstants.base} element={<Outlet />}>
    <Route path={DevScreensConstants.kitchenSink} element={<KitchenSink />} />
    <Route
      path={`${DevScreensConstants.base}/${DevScreensConstants.iframeOverview}`}
      element={<IFrameOverview />}
    />
  </Route>
)

import React from "react"
import { Route, Routes } from "react-router-dom"
import { IFrameOverviewScreen } from "./iframe-overview"
import { CopyDevices } from "./copy-devices"
import { KitchenSink } from "./kitchen-sink"

export const ProtypeRoutes = () => {
  return (
    <Routes>
      <Route path="/copy-devices" element={<CopyDevices />} />
      <Route path="/kitchen-sink" element={<KitchenSink />} />
      <Route path="/iframe-overview" element={<IFrameOverviewScreen />} />
    </Routes>
  )
}

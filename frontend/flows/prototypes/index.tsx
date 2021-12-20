import React from "react"
import { Route, Routes } from "react-router-dom"
import { IFrameOverviewScreen } from "./iframe-overview"
import { CopyDevices } from "./copy-devices"

export const ProtypeRoutes = () => {
  return (
    <Routes>
      <Route path="/copy-devices" element={<CopyDevices />} />
      <Route path="/iframe-overview" element={<IFrameOverviewScreen />} />
    </Routes>
  )
}

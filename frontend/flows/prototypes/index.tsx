import React from "react"
import { Route, Routes } from "react-router-dom"
import { CopyDevices } from "./copy-devices"

export const ProtypeRoutes = () => {
  return (
    <Routes>
      <Route path="/copy-devices" element={<CopyDevices />} />
    </Routes>
  )
}

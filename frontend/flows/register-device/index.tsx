import React from "react"
import { Route, Routes } from "react-router-dom"
import { NewFromDelegate } from "./new-from-delegate"

export const RegisterDeviceRoutes = () => (
  <Routes>
    <Route
      path="/register-new-device/:secret/:userNumber"
      element={<NewFromDelegate />}
    />
  </Routes>
)

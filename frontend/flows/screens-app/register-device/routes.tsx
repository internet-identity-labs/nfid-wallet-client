import React from "react"
import { Outlet, Route } from "react-router-dom"
import { RegisterDevice } from "."

// Prompt routes

// New device routes
export const RegisterNewDeviceConstants = {
  base: "/register-new-device",
}

export const RegisterNewDeviceRoutes = (
  <Route path={RegisterNewDeviceConstants.base} element={<Outlet />}>
    <Route path={":secret/:userNumber"} element={<RegisterDevice />} />
  </Route>
)

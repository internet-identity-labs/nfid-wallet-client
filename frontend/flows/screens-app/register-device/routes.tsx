import React from "react"
import { Outlet, Route } from "react-router-dom"
import { RegisterDevice } from "."

// Prompt routes

// New device routes
export const RegisterNewDeviceConstants = {
  base: "/register-new-device",
  register: ":secret/:userNumber",
}

export const RegisterNewDeviceRoutes = (
  <Route path={RegisterNewDeviceConstants.base} element={<Outlet />}>
    <Route
      path={RegisterNewDeviceConstants.register}
      element={<RegisterDevice />}
    />
  </Route>
)

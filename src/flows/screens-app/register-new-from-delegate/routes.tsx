import React from "react"
import { Route } from "react-router-dom"

import { RegisterNewFromDelegate } from "frontend/screens/register-new-from-delegate"

// Prompt routes

// New device routes
export const RegisterNewDeviceConstants = {
  base: "/register-new-device/:userNumber",
}

export const RegisterNewDeviceRoutes = (
  <Route
    path={RegisterNewDeviceConstants.base}
    element={<RegisterNewFromDelegate />}
  />
)

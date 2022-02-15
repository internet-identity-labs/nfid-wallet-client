import React from "react"
import { Outlet, Route } from "react-router-dom"
import { AuthWrapper } from "../auth-wrapper"
import { RegisterDevicePrompt } from "./authorize-or-register-prompt"
import { RegisterNewFromDelegate } from "./new-from-delegate"
import { RegisterDevicePromptSuccess } from "./success"

// Prompt routes
export const RegisterDevicePromptConstants = {
  base: "/rdp",
  authorize: ":secret/:scope/:applicationName",
  success: "success",
}

export const RegisterDevicePromptRoutes = (
  <Route path={RegisterDevicePromptConstants.base}>
    <Route
      path={RegisterDevicePromptConstants.authorize}
      element={
        <AuthWrapper>
          <RegisterDevicePrompt />
        </AuthWrapper>
      }
    />
    <Route
      path={RegisterDevicePromptConstants.success}
      element={
        <AuthWrapper>
          <RegisterDevicePromptSuccess />
        </AuthWrapper>
      }
    />
  </Route>
)

// New device routes
export const RegisterNewDeviceConstants = {
  base: "/register-new-device",
}

export const RegisterNewDeviceRoutes = (
  <Route path={RegisterNewDeviceConstants.base} element={<Outlet />}>
    <Route path={":secret/:userNumber"} element={<RegisterNewFromDelegate />} />
  </Route>
)

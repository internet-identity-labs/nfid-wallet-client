import React from "react"
import { Route } from "react-router-dom"
import { RegisterDevicePrompt } from "./authorize"
import { AuthWrapper } from "../auth-wrapper"

export const RegisterDevicePromptConstants = {
  base: "/rdp",
  authorize: ":secret/:scope/:applicationName",
}

export const RegisterDevicePromptRoutes = (redirectTo: string) => (
  <Route path={RegisterDevicePromptConstants.base}>
    <Route
      path={RegisterDevicePromptConstants.authorize}
      element={
        <AuthWrapper redirectTo={redirectTo}>
          <RegisterDevicePrompt />
        </AuthWrapper>
      }
    />
  </Route>
)

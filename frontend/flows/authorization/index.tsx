import React from "react"
import { Route, Routes } from "react-router-dom"
import { AuthWrapper } from "../auth-wrapper"
import { REGISTER_DEVICE_PROMPT } from "../constants"
import { RegisterDevicePrompt } from "./authorize-or-register-prompt"
import { RegisterDevicePromptSuccess } from "./success"
import { AwaitingConfirmation } from "../register/awaiting-confirmation"

export const AuthorizationRoutes = () => {
  return (
    <Routes>
      <Route
        path={REGISTER_DEVICE_PROMPT.path}
        element={
          <AuthWrapper>
            <RegisterDevicePrompt />
          </AuthWrapper>
        }
      />
      <Route
        path="/rdp/success"
        element={
          <AuthWrapper>
            <RegisterDevicePromptSuccess />
          </AuthWrapper>
        }
      />
      <Route
        path="/register-confirmation/:secret"
        element={
          <AuthWrapper>
            <AwaitingConfirmation />
          </AuthWrapper>
        }
      />
    </Routes>
  )
}

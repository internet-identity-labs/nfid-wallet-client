import React from "react"
import { Outlet } from "react-router"
import { AuthWrapper } from "../auth-wrapper"
import { RegisterDevicePrompt } from "./authorize-or-register-prompt"
import { NewFromDelegate } from "./new-from-delegate"
import { RegisterDevicePromptSuccess } from "./success"

// Prompt routes
export const RegisterDevicePromptConstants = {
  base: "/rdp",
  success: "success",
}

export const RegisterDevicePromptRoutes = {
  path: RegisterDevicePromptConstants.base,
  children: [
    {
      path: ":secret/:scope",
      element: (
        <AuthWrapper>
          <RegisterDevicePrompt />
        </AuthWrapper>
      ),
    },
    {
      path: RegisterDevicePromptConstants.success,
      element: (
        <AuthWrapper>
          <RegisterDevicePromptSuccess />
        </AuthWrapper>
      ),
    },
  ],
}

// New device routes
export const RegisterNewDeviceConstants = {
  base: "/register-new-device",
}

export const RegisterNewDeviceRoutes = {
  path: RegisterNewDeviceConstants.base,
  children: [
    {
      path: ":secret/:userNumber",
      element: <NewFromDelegate />,
    },
  ],
}

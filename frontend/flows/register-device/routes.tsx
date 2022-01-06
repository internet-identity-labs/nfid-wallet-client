import React from "react"
import { AuthWrapper } from "../auth-wrapper"
import { RegisterDevicePrompt } from "./authorize-or-register-prompt"
import { NewFromDelegate } from "./new-from-delegate"
import { RegisterDevicePromptSuccess } from "./success"

export const CONSTANTS = {
  base: "rdp",
  success: "success",
  newDevice: "new-device",
}

export const RegisterDeviceRoutes = {
  path: CONSTANTS.base,
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
      path: CONSTANTS.success,
      element: (
        <AuthWrapper>
          <RegisterDevicePromptSuccess />
        </AuthWrapper>
      ),
    },
    {
      path: `${CONSTANTS.newDevice}/:secret/:userNumber`,
      element: <NewFromDelegate />,
    },
  ],
}

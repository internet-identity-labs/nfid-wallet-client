import React from "react"
import { AuthWrapper } from "../auth-wrapper"
import { RegisterDevicePrompt } from "./authorize-or-register-prompt"
import { NewFromDelegate } from "./new-from-delegate"
import { RegisterDevicePromptSuccess } from "./success"

export const RegisterDeviceConstants = {
  base: "rdp",
  success: "success",
  newDevice: "new-device",
}

export const RegisterDeviceRoutes = {
  path: RegisterDeviceConstants.base,
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
      path: RegisterDeviceConstants.success,
      element: (
        <AuthWrapper>
          <RegisterDevicePromptSuccess />
        </AuthWrapper>
      ),
    },
    {
      path: `${RegisterDeviceConstants.newDevice}/:secret/:userNumber`,
      element: <NewFromDelegate />,
    },
  ],
}

import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

import { AuthorizeAppUnknownDevice } from "."

interface IFrameAuthorizeAppUnknownDeviceProps {
  registerDeviceDeciderPath: string
}

export const IFrameAuthorizeAppUnknownDevice: React.FC<
  IFrameAuthorizeAppUnknownDeviceProps
> = ({ registerDeviceDeciderPath }) => {
  return (
    <IFrameScreen>
      <AuthorizeAppUnknownDevice
        registerDeviceDeciderPath={registerDeviceDeciderPath}
      />
    </IFrameScreen>
  )
}

import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

import { AuthorizeAppUnknownDevice } from "."

interface IFrameAuthorizeAppUnknownDeviceProps {
  recoverNFIDPath: string
  registerDeviceDeciderPath: string
}

export const IFrameAuthorizeAppUnknownDevice: React.FC<
  IFrameAuthorizeAppUnknownDeviceProps
> = ({ recoverNFIDPath, registerDeviceDeciderPath }) => {
  return (
    <IFrameScreen>
      <AuthorizeAppUnknownDevice
        recoverNFIDPath={recoverNFIDPath}
        registerDeviceDeciderPath={registerDeviceDeciderPath}
      />
    </IFrameScreen>
  )
}

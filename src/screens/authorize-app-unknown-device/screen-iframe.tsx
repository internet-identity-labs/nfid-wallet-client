import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

import { AuthorizeAppUnknownDevice, AuthorizeAppUnknownDeviceProps } from "."

interface IFrameAuthorizeAppUnknownDeviceProps
  extends AuthorizeAppUnknownDeviceProps {}

export const IFrameAuthorizeAppUnknownDevice: React.FC<
  IFrameAuthorizeAppUnknownDeviceProps
> = ({ registerDeviceDeciderPath, url, showRegister, applicationName }) => {
  return (
    <IFrameScreen
      isLoading
      loadingMessage="Waiting for verification on mobile ..."
    >
      <AuthorizeAppUnknownDevice
        registerDeviceDeciderPath={registerDeviceDeciderPath}
        applicationName={applicationName}
        showRegister={showRegister}
        url={url}
      />
    </IFrameScreen>
  )
}

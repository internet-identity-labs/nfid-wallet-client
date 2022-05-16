import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

import { AuthorizeAppUnknownDevice, AuthorizeAppUnknownDeviceProps } from "."

interface IFrameAuthorizeAppUnknownDeviceProps
  extends AuthorizeAppUnknownDeviceProps {
  isLoading: boolean
}

export const IFrameAuthorizeAppUnknownDevice: React.FC<
  IFrameAuthorizeAppUnknownDeviceProps
> = ({
  registerDeviceDeciderPath,
  url,
  showRegister,
  applicationName,
  isLoading,
}) => {
  return (
    <IFrameScreen
      isLoading={isLoading}
      loadingMessage="Waiting for verification on mobile ..."
    >
      <AuthorizeAppUnknownDevice
        registerDeviceDeciderPath={registerDeviceDeciderPath}
        registerSameDevicePath={url ?? ""}
        applicationName={applicationName}
        showRegister={showRegister}
        url={url}
      />
    </IFrameScreen>
  )
}

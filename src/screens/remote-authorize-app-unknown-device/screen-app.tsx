import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import {
  RemoteAuthorizeAppUnknownDevice,
  AuthorizeAppUnknownDeviceProps,
} from "."

interface AppScreenAuthorizeAppUnknownDeviceProps
  extends AuthorizeAppUnknownDeviceProps {
  isLoading?: boolean
}

export const AppScreenAuthorizeAppUnknownDevice: React.FC<
  AppScreenAuthorizeAppUnknownDeviceProps
> = ({
  registerDeviceDeciderPath,
  registerSameDevicePath,
  url,
  showRegister,
  applicationName,
  isLoading,
}) => {
  return (
    <AppScreen
      isFocused
      bubbleOptions={{ showBubbles: false }}
      isLoading={isLoading}
      loadingMessage="Waiting for verification on mobile ..."
    >
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <RemoteAuthorizeAppUnknownDevice
            registerDeviceDeciderPath={registerDeviceDeciderPath}
            registerSameDevicePath={registerSameDevicePath}
            url={url}
            showRegister={showRegister}
            applicationName={applicationName}
            isLoading={isLoading}
          />
        </div>
      </main>
    </AppScreen>
  )
}

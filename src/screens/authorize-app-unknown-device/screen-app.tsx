import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { AuthorizeAppUnknownDevice, AuthorizeAppUnknownDeviceProps } from "."

interface AppScreenAuthorizeAppUnknownDeviceProps
  extends AuthorizeAppUnknownDeviceProps {
  isLoading?: boolean
}

export const AppScreenAuthorizeAppUnknownDevice: React.FC<
  AppScreenAuthorizeAppUnknownDeviceProps
> = ({
  registerDeviceDeciderPath,
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
          <AuthorizeAppUnknownDevice
            registerDeviceDeciderPath={registerDeviceDeciderPath}
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

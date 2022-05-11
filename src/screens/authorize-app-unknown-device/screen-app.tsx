import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { AuthorizeAppUnknownDevice } from "."

interface AppScreenAuthorizeAppUnknownDeviceProps {
  recoverNFIDPath: string
  registerDeviceDeciderPath: string
}

export const AppScreenAuthorizeAppUnknownDevice: React.FC<
  AppScreenAuthorizeAppUnknownDeviceProps
> = ({ recoverNFIDPath, registerDeviceDeciderPath }) => {
  return (
    <AppScreen isFocused bubbleOptions={{ showBubbles: false }}>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <AuthorizeAppUnknownDevice
            recoverNFIDPath={recoverNFIDPath}
            registerDeviceDeciderPath={registerDeviceDeciderPath}
          />
        </div>
      </main>
    </AppScreen>
  )
}

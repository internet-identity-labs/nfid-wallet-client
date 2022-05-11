import { Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { useInterval } from "frontend/hooks/use-interval"

import { useUnknownDeviceConfig } from "../authorize-app-unknown-device/hooks/use-unknown-device.config"
import { IFrameRegisterDeviceDecider } from "../register-device-decider/screen-iframe"

interface UnknownDeviceScreenProps {
  iframe?: boolean
}

export const UnknownDeviceScreen: React.FC<UnknownDeviceScreenProps> = ({
  iframe,
}) => {
  const { status, showRegister, handlePollForDelegate } =
    useUnknownDeviceConfig()
  const isLoading = status === "loading"

  useInterval(handlePollForDelegate, 2000)

  return (
    <div className={clsx("relative")}>
      {/* IFrmaeRegisterDecider */}
      {showRegister && <IFrameRegisterDeviceDecider />}

      {/* IFrameAuthorizeAppUnkownDevice(AwaitConfirmationState)  */}
    </div>
  )
}

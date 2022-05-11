import React from "react"

import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { IFrameAuthorizeAppUnknownDevice } from "frontend/screens/authorize-app-unknown-device/screen-iframe"

import {
  IFRAME_AUTHENTICATE_BASE,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "../constants"

interface LoginUnknownDeviceProps {}

export const LoginUnknownDevice: React.FC<LoginUnknownDeviceProps> = () => {
  const { applicationName } = useMultipass()
  const { url, status, handlePollForDelegate, showRegister } =
    useUnknownDeviceConfig()
  const isLoading = status === "loading"

  useInterval(handlePollForDelegate, 2000)
  return (
    <IFrameAuthorizeAppUnknownDevice
      registerDeviceDeciderPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
      applicationName={applicationName}
      isLoading={isLoading}
      showRegister={showRegister}
      url={url}
    />
  )
}

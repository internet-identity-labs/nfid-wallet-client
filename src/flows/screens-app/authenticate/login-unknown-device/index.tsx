import React from "react"

import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"
import { RemoteAuthorizeAppUnknownDevice } from "frontend/screens/remote-authorize-app-unknown-device"
import { useUnknownDeviceConfig } from "frontend/screens/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import {
  APP_SCREEN_AUTHENTICATE_BASE,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "../constants"

interface LoginUnknownDeviceProps {
  registerSameDevicePath: string
}

export const LoginUnknownDevice: React.FC<LoginUnknownDeviceProps> = ({
  registerSameDevicePath,
}) => {
  const { applicationName } = useMultipass()
  const { url, status, handlePollForDelegate, showRegister } =
    useUnknownDeviceConfig()
  const isLoading = status === "loading"

  useInterval(handlePollForDelegate, 2000)
  return (
    <RemoteAuthorizeAppUnknownDevice
      registerDeviceDeciderPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
      registerSameDevicePath={registerSameDevicePath}
      applicationName={applicationName}
      isLoading={isLoading}
      showRegister={showRegister}
      url={url}
    />
  )
}

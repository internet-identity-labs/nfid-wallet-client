import React from "react"

import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { useInterval } from "frontend/apps/inter-device/use-interval"
import { RemoteAuthorizeAppUnknownDevice } from "frontend/ui/pages/remote-authorize-app-unknown-device"
import { useUnknownDeviceConfig } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

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
  const { generatePath, navigate } = useNFIDNavigate()
  const { applicationLogo, applicationName } = useMultipass()
  const { url, status, handlePollForDelegate, showRegister } =
    useUnknownDeviceConfig()
  const isLoading = status === "loading"

  React.useEffect(() => {
    if (showRegister) {
      navigate(
        generatePath(
          `${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`,
        ),
      )
    }
  }, [generatePath, navigate, showRegister])

  useInterval(handlePollForDelegate, 2000)
  return (
    <ScreenResponsive
      isLoading={isLoading}
      loadingMessage="Waiting for verification on mobile..."
    >
      <RemoteAuthorizeAppUnknownDevice
        registerSameDevicePath={registerSameDevicePath}
        applicationName={applicationName ?? ""}
        applicationLogo={applicationLogo ?? ""}
        showRegister={showRegister}
        url={url}
      />
    </ScreenResponsive>
  )
}

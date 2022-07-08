import { useAtom } from "jotai"

import { RemoteAuthorizeAppUnknownDevice } from "frontend/design-system/pages/remote-authorize-app-unknown-device"
import { useUnknownDeviceConfig } from "frontend/design-system/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import {
  APP_SCREEN_AUTHENTICATE_BASE,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "frontend/apps/authentication/authenticate/constants"

export const RemoteAuthenticate: React.FC<{ machine: any }> = ({ machine }) => {
  const [, send] = useAtom(machine)
  const { url } = useUnknownDeviceConfig()

  return (
    <RemoteAuthorizeAppUnknownDevice
      onLoginSuccess={() => send("AUTHENTICATED")}
      registerDeviceDeciderPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
      registerSameDevicePath={"/register-device-decider"}
      url={url ?? "https://nfid.one/secret/scope/my-application"}
      showRegister={false}
    />
  )
}

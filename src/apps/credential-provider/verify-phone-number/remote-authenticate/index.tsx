import { useAtom } from "jotai"

import {
  APP_SCREEN_AUTHENTICATE_BASE,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "frontend/apps/authentication/authenticate/constants"
import { RemoteAuthorizeAppUnknownDevice } from "frontend/ui/pages/remote-authorize-app-unknown-device"
import { useUnknownDeviceConfig } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

export const RemoteAuthenticate: React.FC<{ machine: any }> = ({ machine }) => {
  const [, send] = useAtom(machine)
  const { url } = useUnknownDeviceConfig()

  return (
    <RemoteAuthorizeAppUnknownDevice
      applicationLogo="FIXME: pull from context"
      applicationName="FIXME: pull from context"
      onLoginSuccess={() => send("AUTHENTICATED")}
      registerDeviceDeciderPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
      registerSameDevicePath={"/register-device-decider"}
      url={url ?? "https://nfid.one/secret/scope/my-application"}
      showRegister={false}
    />
  )
}

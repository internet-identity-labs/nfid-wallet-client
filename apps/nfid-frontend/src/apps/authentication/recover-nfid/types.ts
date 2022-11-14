import { WebAuthnDevice } from "frontend/integration/identity-manager/devices/hooks"

export interface NewDeviceEvent {
  data: {
    kind: "new-device"
    device: WebAuthnDevice
  }
}

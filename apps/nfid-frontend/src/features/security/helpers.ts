import { DeviceType } from "@nfid/integration"

import { IDevice } from "./types"

export const isRecoveryDevice = (device: IDevice): boolean => {
  return (
    device.type === DeviceType.Recovery ||
    device.label.includes("Recovery") ||
    !device.label.includes("Security Key")
  )
}

export const isPasskeyDevice = (device: IDevice): boolean => {
  return (
    !device.label.includes("Recovery") &&
    (device.type === DeviceType.Passkey ||
      device.type === DeviceType.Unknown ||
      device.label.includes("Security Key"))
  )
}

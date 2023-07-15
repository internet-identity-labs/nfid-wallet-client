import { DeviceType } from "@nfid/integration"

import { IDevice } from "./types"

export const isRecoveryDevice = (device: IDevice): boolean => {
  return (
    !device.label.includes("Security Key") &&
    (device.type === DeviceType.Recovery || device.label.includes("Recovery"))
  )
}

export const isPasskeyDevice = (device: IDevice): boolean => {
  return (
    !device.label.includes("Recovery") &&
    !device.label.includes("Google") &&
    (device.type === DeviceType.Passkey ||
      device.type === DeviceType.Unknown ||
      device.label.includes("Security Key"))
  )
}

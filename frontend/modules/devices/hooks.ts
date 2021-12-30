import { IIConnection } from "frontend/utils/internet-identity/iiConnection"
import produce from "immer"
import React from "react"
import { UserNumber } from "./../../utils/internet-identity/generated/internet_identity_types.d"
import { Device } from "./types"

export const useDevice = (_userNumber: UserNumber) => {
  const [devices, setDevices] = React.useState<Device[]>([])
  const [userNumber, setUserNumber] = React.useState<UserNumber>(_userNumber)

  const readDevices = React.useCallback(async () => {
    // const devices = await IIConnection.lookupAll(BigInt(userNumber))
    // setDevices(devices)

    return devices.length
  }, [devices.length])

  React.useEffect(() => {
    userNumber && readDevices()
  }, [devices, readDevices, userNumber])

  const createDevice = React.useCallback(
    async (device: Device) => {
      const uniqueDevice = () => {
        const existingDevices = devices.findIndex(
          (existingDevice) => existingDevice.alias === device.alias,
        )
        return existingDevices === -1
      }

      if (uniqueDevice()) {
        const newDevice = produce(device, (draft: Device) => {
          draft.lastUsed = new Date().toISOString()
          draft.browser = device.browser
          draft.make = device.make
          draft.model = device.model
          draft.pubKeyHash = device.pubKeyHash
          draft.alias = device.alias
        })

        setDevices([...devices, newDevice])
      }
    },
    [devices],
  )

  return {
    createDevice,
    readDevices,
  }
}

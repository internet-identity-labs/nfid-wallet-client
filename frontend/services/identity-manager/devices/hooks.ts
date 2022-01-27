import { useAuthentication } from "frontend/flows/auth-wrapper"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import produce from "immer"
import { useAtom } from "jotai"
import React from "react"
import { useAccount } from "../account/hooks"
import { Device, devicesAtom } from "./state"

export const useDevices = () => {
  const [devices, setDevices] = useAtom(devicesAtom)

  const { userNumber } = useAccount()
  const { internetIdentity } = useAuthentication()

  const updateDevices = React.useCallback(
    (partialDevices: Partial<Device[]>) => {
      const newDevices = produce(devices, (draft: Device) => ({
        ...draft,
        ...partialDevices,
      }))
      setDevices(newDevices)
    },
    [devices, setDevices],
  )

  const handleLoadDevices = React.useCallback(async () => {
    if (userNumber) {
      const existingDevices = await IIConnection.lookupAll(userNumber)
      setDevices(existingDevices)
    }
  }, [setDevices, userNumber])

  const deleteDevice = React.useCallback(
    async (pubkey) => {
      if (internetIdentity && userNumber) {
        await internetIdentity.remove(userNumber, pubkey)
      }
    },
    [internetIdentity, userNumber],
  )

  const getDevices = React.useCallback(async () => {
    await handleLoadDevices()
  }, [handleLoadDevices])

  React.useEffect(() => {
    let timer: NodeJS.Timer
    if (internetIdentity) {
      timer = setInterval(handleLoadDevices, 2000)
    }
    return () => clearInterval(timer)
  }, [internetIdentity, handleLoadDevices])

  return {
    devices,
    getDevices,
    updateDevices,
    handleLoadDevices,
    deleteDevice,
  }
}

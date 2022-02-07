import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { useAuthentication } from "frontend/flows/auth-wrapper"
import {
  creationOptions,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import { getBrowser, getPlatform } from "frontend/utils"
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

  const createWebAuthNDevice = React.useCallback(
    async (secret: string, userNumber: bigint) => {
      const existingDevices = await IIConnection.lookupAll(userNumber)

      const identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
      const publicKey = identity.getPublicKey().toDer()
      const device = {
        publicKey,
        rawId: blobToHex(identity.rawId),
        deviceName: `NFID ${getBrowser()} on ${getPlatform()}`,
      }

      return { device }
    },
    [],
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
    createWebAuthNDevice,
    getDevices,
    updateDevices,
    handleLoadDevices,
    deleteDevice,
  }
}

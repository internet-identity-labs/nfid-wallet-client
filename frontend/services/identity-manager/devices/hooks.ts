import { blobFromHex, blobToHex, derBlobFromBlob } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import {
  creationOptions,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import produce from "immer"
import { useAtom } from "jotai"
import React from "react"
import { useAccount } from "../account/hooks"
import { Device, devicesAtom } from "./state"

export const useDevices = () => {
  const [devices, setDevices] = useAtom(devicesAtom)
  const { newDeviceName } = useDeviceInfo()

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
    async (userNumber: bigint) => {
      const existingDevices = await IIConnection.lookupAll(userNumber)

      const identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
      const publicKey = blobToHex(identity.getPublicKey().toDer())
      const rawId = blobToHex(identity.rawId)

      const device = {
        publicKey,
        rawId,
        deviceName: newDeviceName,
      }

      return { device }
    },
    [newDeviceName],
  )

  const createDevice = React.useCallback(
    async ({
      userNumber,
      deviceName,
      publicKey,
      rawId,
    }: {
      userNumber: bigint
      deviceName: string
      publicKey: string
      rawId: string
    }) => {
      if (!internetIdentity) throw new Error("Unauthorized")

      const response = await internetIdentity.add(
        userNumber,
        deviceName,
        { unknown: null },
        { authentication: null },
        derBlobFromBlob(blobFromHex(publicKey)),
        blobFromHex(rawId),
      )
      console.log(">> createDevice", { response })
      return response
    },
    [internetIdentity],
  )

  const getDevices = React.useCallback(async () => {
    await handleLoadDevices()
  }, [handleLoadDevices])

  React.useEffect(() => {
    handleLoadDevices()
  }, [userNumber, handleLoadDevices])

  return {
    devices,
    createWebAuthNDevice,
    getDevices,
    createDevice,
    updateDevices,
    handleLoadDevices,
    deleteDevice,
  }
}

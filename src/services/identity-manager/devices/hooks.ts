import { blobFromHex, blobToHex, derBlobFromBlob } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { useAtom } from "jotai"
import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { DeviceData } from "frontend/services/internet-identity/generated/internet_identity_types"
import {
  creationOptions,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"

import { useAccount } from "../account/hooks"
import {
  AccessPointRequest,
  AccessPointResponse,
} from "../identity_manager.did"
import { Device, devicesAtom, Icon, recoveryDevicesAtom } from "./state"

const normalizeDevices = (
  devices: DeviceData[],
  accessPoints: AccessPointResponse[] = [],
): Device[] => {
  console.debug(">> normalizeDevices", { devices, accessPoints })

  return devices.map((device) => {
    const devicePrincipalId = Principal.selfAuthenticating(
      new Uint8Array(device.pubkey),
    ).toString()
    const accessPoint = accessPoints.find(
      (ap) => ap.principal_id === devicePrincipalId,
    )
    return {
      isAccessPoint: !!accessPoint,
      label: accessPoint?.device || device.alias,
      icon: (accessPoint?.icon as Icon) || "desktop",
      pubkey: device.pubkey,
      browser: accessPoint?.browser || "",
    }
  })
}

const normalizeDeviceRequest = (device: Device): AccessPointRequest => {
  return {
    icon: device.icon,
    device: device.label,
    pub_key: device.pubkey,
    browser: device.browser,
  }
}

export const useDevices = () => {
  const [devices, setDevices] = useAtom(devicesAtom)
  const [recoveryDevices, setRecoveryDevices] = useAtom(recoveryDevicesAtom)

  const {
    newDeviceName,
    browser: { name: browserName },
  } = useDeviceInfo()

  const { userNumber } = useAccount()
  const { internetIdentity, identityManager } = useAuthentication()

  const handleLoadDevices = React.useCallback(async () => {
    if (userNumber) {
      const [accessPoints, existingDevices] = await Promise.all([
        identityManager?.read_access_points(),
        IIConnection.lookupAuthenticators(userNumber),
      ])
      console.debug(">> handleLoadDevices", { accessPoints, existingDevices })

      if (accessPoints?.status_code === 200) {
        const normalizedDevices = normalizeDevices(
          existingDevices,
          accessPoints?.data[0],
        )
        console.debug(">> handleLoadDevices", { normalizedDevices })

        setDevices(normalizedDevices)
      }
    }
  }, [identityManager, setDevices, userNumber])

  const updateDevice = React.useCallback(
    async (device: Device) => {
      const normalizedDevice = normalizeDeviceRequest(device)
      console.debug(">> updateDevice", { normalizedDevice })

      if (!device.isAccessPoint) {
        const createAccessPointResponse =
          await identityManager?.create_access_point(normalizedDevice)
        handleLoadDevices()
        console.debug(">> updateDevice", { createAccessPointResponse })
        return createAccessPointResponse
      }
      const updatedAccessPoint = await identityManager?.update_access_point(
        normalizedDevice,
      )
      console.debug(">> updateDevice", { updatedAccessPoint })
      handleLoadDevices()
      return updatedAccessPoint
    },
    [handleLoadDevices, identityManager],
  )

  const getRecoveryDevices = React.useCallback(async () => {
    if (userNumber) {
      const recoveryDevices = await IIConnection.lookupRecovery(userNumber)
      setRecoveryDevices(recoveryDevices)
    }
  }, [setRecoveryDevices, userNumber])

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
      if (!internetIdentity || !identityManager) throw new Error("Unauthorized")

      const pub_key = derBlobFromBlob(blobFromHex(publicKey))
      console.log(">> createDevice", { pub_key })

      await Promise.all([
        internetIdentity.add(
          userNumber,
          deviceName,
          { unknown: null },
          { authentication: null },
          pub_key,
          blobFromHex(rawId),
        ),
        identityManager.create_access_point({
          icon: "",
          device: deviceName,
          browser: browserName ?? "",
          pub_key: Array.from(pub_key),
        }),
      ])
    },
    [internetIdentity, identityManager, browserName],
  )

  const recoverDevice = React.useCallback(
    async (userNumber) => {
      try {
        if (!internetIdentity || !identityManager)
          throw new Error("Unauthorized")
        const { device } = await createWebAuthNDevice(BigInt(userNumber))

        await createDevice({
          ...device,
          userNumber,
        })

        return {
          message: "Device created successfully",
        }
      } catch (error) {
        if (
          (error as DOMException).message ===
          "The user attempted to register an authenticator that contains one of the credentials already registered with the relying party."
        ) {
          console.log(">> recoverDevice", {
            message: "This device is already registered",
          })

          return {
            message: "This device is already registered",
          }
        }
        throw error
      }
    },
    [createDevice, createWebAuthNDevice, identityManager, internetIdentity],
  )

  const getDevices = React.useCallback(async () => {
    await handleLoadDevices()
  }, [handleLoadDevices])

  React.useEffect(() => {
    handleLoadDevices()
  }, [userNumber, handleLoadDevices])

  return {
    devices,
    recoveryDevices,
    createWebAuthNDevice,
    getDevices,
    getRecoveryDevices,
    createDevice,
    recoverDevice,
    updateDevice,
    handleLoadDevices,
    deleteDevice,
  }
}

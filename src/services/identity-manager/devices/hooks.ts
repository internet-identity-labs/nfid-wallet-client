import {
  fromHexString,
  toHexString,
} from "@dfinity/candid/lib/cjs/utils/buffer"
import { WebAuthnIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { useAtom } from "jotai"
import React from "react"

import { im } from "frontend/api/actors"
import {
  AccessPointRequest,
  AccessPointResponse,
} from "frontend/api/idl/identity_manager.did"
import { DeviceData, PublicKey } from "frontend/api/idl/internet_identity_types"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { fromMnemonicWithoutValidation } from "frontend/services/internet-identity/crypto/ed25519"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"
import {
  creationOptions,
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"

import { useAccount } from "../account/hooks"
import {
  Device,
  devicesAtom,
  Icon,
  RecoveryDevice,
  recoveryDevicesAtom,
} from "./state"

const getIcon = (device: DeviceData): Icon => {
  switch (device.alias.split(" ")[3]) {
    case "Android":
    case "iOS":
      return "mobile"
    case "Mac OS":
      return "desktop"
    default:
      return "laptop"
  }
}

const getBrowser = (device: DeviceData): string => {
  return device.alias.replace("NFID", "").split(" on ")[0]
}

const getDeviceName = (device: DeviceData): string => {
  return device.alias.replace("NFID", "").split(" on ")[1]
}

const normalizeDevices = (
  devices: DeviceData[],
  accessPoints: AccessPointResponse[] = [],
): Device[] => {
  return devices.map((device) => {
    const devicePrincipalId = Principal.selfAuthenticating(
      new Uint8Array(device.pubkey),
    ).toString()
    const accessPoint = accessPoints.find(
      (ap) => ap.principal_id === devicePrincipalId,
    )
    return {
      isAccessPoint: !!accessPoint,
      label: accessPoint?.device || getDeviceName(device),
      icon: (accessPoint?.icon as Icon) || getIcon(device),
      pubkey: device.pubkey,
      lastUsed: accessPoint?.last_used
        ? Number(BigInt(accessPoint.last_used) / BigInt(1000000))
        : 0,
      browser: accessPoint?.browser || getBrowser(device),
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

const getRecoveryDeviceLabel = (accessPoint?: AccessPointResponse) => {
  if (accessPoint?.device === "recovery") {
    return "Recovery Phrase"
  }
  if (accessPoint?.device) {
    return accessPoint.device
  }
  return "Unknown Device"
}

const getRecoveryDeviceIcon = (accessPoint?: AccessPointResponse): Icon => {
  if (accessPoint?.icon === "recovery") {
    return "document"
  }
  if (accessPoint?.icon) {
    return accessPoint.icon as Icon
  }
  return "usb"
}

const normalizeRecoveryDevices = (
  devices: DeviceData[],
  accessPoints: AccessPointResponse[] = [],
): RecoveryDevice[] => {
  return devices.map((device) => {
    const devicePrincipalId = Principal.selfAuthenticating(
      new Uint8Array(device.pubkey),
    ).toString()
    const accessPoint = accessPoints.find(
      (ap) => ap.principal_id === devicePrincipalId,
    )

    return {
      isAccessPoint: !!accessPoint,
      label: getRecoveryDeviceLabel(accessPoint),
      icon: getRecoveryDeviceIcon(accessPoint),
      pubkey: device.pubkey,
      lastUsed: accessPoint?.last_used
        ? Number(BigInt(accessPoint.last_used) / BigInt(1000000))
        : 0,
      isRecoveryPhrase:
        Object.keys(device.key_type).indexOf("seed_phrase") > -1,
      isSecurityKey:
        Object.keys(device.key_type).indexOf("cross_platform") > -1,
    }
  })
}

export const useDevices = () => {
  const [devices, setDevices] = useAtom(devicesAtom)
  const [recoveryDevices, setRecoveryDevices] = useAtom(recoveryDevicesAtom)

  const {
    newDeviceName,
    browser: { name: browserName },
  } = useDeviceInfo()

  const { userNumber } = useAccount()
  const { user } = useAuthentication()

  const handleLoadDevices = React.useCallback(async () => {
    if (userNumber) {
      const [accessPoints, existingDevices] = await Promise.all([
        im.read_access_points(),
        IIConnection.lookupAuthenticators(userNumber),
      ])

      if (accessPoints?.status_code === 200) {
        const normalizedDevices = normalizeDevices(
          existingDevices,
          accessPoints?.data[0],
        )

        setDevices(normalizedDevices)
      }
    }
  }, [setDevices, userNumber])

  const updateDevice = React.useCallback(
    async (device: Device) => {
      const normalizedDevice = normalizeDeviceRequest(device)

      if (!device.isAccessPoint) {
        const createAccessPointResponse = await im.create_access_point(
          normalizedDevice,
        )
        handleLoadDevices()
        return createAccessPointResponse
      }
      const updatedAccessPoint = await im.update_access_point(normalizedDevice)
      handleLoadDevices()
      return updatedAccessPoint
    },
    [handleLoadDevices],
  )

  const getRecoveryDevices = React.useCallback(async () => {
    if (userNumber) {
      const [accessPoints, existingRecoveryDevices] = await Promise.all([
        im.read_access_points(),
        IIConnection.lookupRecovery(userNumber),
      ])

      if (accessPoints?.status_code === 200) {
        const normalizedDevices = normalizeRecoveryDevices(
          existingRecoveryDevices,
          accessPoints?.data[0],
        )

        setRecoveryDevices(normalizedDevices)
      }
    }
  }, [setRecoveryDevices, userNumber])

  const deleteDevice = React.useCallback(
    async (pubkey: PublicKey) => {
      if (user?.internetIdentity && userNumber) {
        await Promise.all([
          user?.internetIdentity.remove(userNumber, pubkey),
          im.remove_access_point({ pub_key: pubkey }),
        ])
      }
    },
    [user, userNumber],
  )

  const createWebAuthNDevice = React.useCallback(
    async (userNumber: bigint) => {
      const existingDevices = await IIConnection.lookupAll(userNumber)

      const identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
      const publicKey = toHexString(identity.getPublicKey().toDer())
      const rawId = toHexString(identity.rawId)

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
      if (!user?.internetIdentity) throw new Error("Unauthorized")

      const pub_key = fromHexString(publicKey)
      const pubKeyBlob = new Blob([pub_key])

      await Promise.all([
        user?.internetIdentity.add(
          userNumber,
          deviceName,
          { unknown: null },
          { authentication: null },
          pubKeyBlob,
          fromHexString(rawId),
        ),
        im.create_access_point({
          icon: "",
          device: deviceName,
          browser: browserName ?? "",
          pub_key: Array.from(new Uint8Array(pub_key)),
        }),
      ])
    },
    [user, browserName],
  )

  const createRecoveryDevice = React.useCallback(
    async (recoverIdentity: Blob, icon?: string, device?: string) => {
      const newDevice = {
        icon: icon ?? "document",
        device: device ?? "Recovery Phrase",
        browser: "",
        pub_key: Array.from(
          new Uint8Array(await recoverIdentity.arrayBuffer()),
        ),
      }

      return await im.create_access_point(newDevice)
    },
    [],
  )

  const recoverDevice = React.useCallback(
    async (userNumber) => {
      try {
        if (!user?.internetIdentity) throw new Error("Unauthorized")
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
          return {
            message: "This device is already registered",
          }
        }
        throw error
      }
    },
    [createDevice, createWebAuthNDevice, user],
  )

  const getDevices = React.useCallback(async () => {
    await handleLoadDevices()
  }, [handleLoadDevices])

  const createRecoveryPhrase = React.useCallback(async () => {
    if (!userNumber) throw new Error("userNumber missing")
    if (!user?.internetIdentity) throw new Error("internetIdentity missing")

    const recovery = generate().trim()
    const recoverIdentity = await fromMnemonicWithoutValidation(
      recovery,
      IC_DERIVATION_PATH,
    )
    const deviceName = "Recovery phrase"

    // TODO: store as access point
    await user?.internetIdentity.add(
      userNumber,
      deviceName,
      { seed_phrase: null },
      { recovery: null },
      new Blob([recoverIdentity.getPublicKey().toDer()]),
    )
    createRecoveryDevice(
      new Blob([recoverIdentity.getPublicKey().toDer()]),
      "document",
      deviceName,
    )
    getRecoveryDevices()
    return `${userNumber} ${recovery}`
  }, [createRecoveryDevice, getRecoveryDevices, user, userNumber])

  const createSecurityDevice = React.useCallback(
    async (
      userNumberOverwrite?: bigint,
      purpose: "recover" | "authentication" = "recover",
    ) => {
      const actualUserNumber = userNumber || userNumberOverwrite
      if (!actualUserNumber) throw new Error("userNumber missing")
      if (!user?.internetIdentity) throw new Error("internetIdentity missing")

      const devices = await IIConnection.lookupAll(actualUserNumber)
      const deviceName = "Security Key"

      let recoverIdentity
      try {
        recoverIdentity = await WebAuthnIdentity.create({
          publicKey: creationOptions(devices, "cross-platform"),
        })
      } catch (error) {
        console.error(error)
        return
      }

      await Promise.all([
        user.internetIdentity.add(
          actualUserNumber,
          deviceName,
          { cross_platform: null },
          purpose && purpose === "recover"
            ? { recovery: null }
            : { authentication: null },
          new Blob([recoverIdentity.getPublicKey().toDer()]),
          recoverIdentity.rawId,
        ),
        createRecoveryDevice(
          new Blob([recoverIdentity.getPublicKey().toDer()]),
          "usb",
          deviceName,
        ),
      ])

      getRecoveryDevices()
      getDevices()
    },
    [createRecoveryDevice, getDevices, getRecoveryDevices, user, userNumber],
  )

  React.useEffect(() => {
    handleLoadDevices()
  }, [userNumber, handleLoadDevices])

  return {
    devices,
    recoveryDevices,
    createWebAuthNDevice,
    createRecoveryPhrase,
    createSecurityDevice,
    getDevices,
    getRecoveryDevices,
    createDevice,
    createRecoveryDevice,
    recoverDevice,
    updateDevice,
    handleLoadDevices,
    deleteDevice,
  }
}

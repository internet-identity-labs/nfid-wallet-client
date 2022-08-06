import {
  fromHexString,
  toHexString,
} from "@dfinity/candid/lib/cjs/utils/buffer"
import { WebAuthnIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { useAtom } from "jotai"
import React from "react"

import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import {
  AccessPointRequest,
  AccessPointResponse,
} from "frontend/integration/_ic_api/identity_manager.did"
import {
  DeviceData,
  PublicKey,
} from "frontend/integration/_ic_api/internet_identity_types"
import { im } from "frontend/integration/actors"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"
import {
  addDevice,
  authState,
  creationOptions,
  fetchAllDevices,
  fetchAuthenticatorDevices,
  fetchRecoveryDevices,
  IC_DERIVATION_PATH,
  removeDevice,
} from "frontend/integration/internet-identity"
import { fromMnemonicWithoutValidation } from "frontend/integration/internet-identity/crypto/ed25519"
import { generate } from "frontend/integration/internet-identity/crypto/mnemonic"
import { derFromPubkey } from "frontend/integration/internet-identity/utils"

import { useAccount } from "../account/hooks"
import {
  LegacyDevice,
  devicesAtom,
  Icon,
  RecoveryDevice,
  recoveryDevicesAtom,
} from "./state"

declare const SIGNIN_GOOGLE: string

export interface WebAuthnDevice {
  publicKey: string
  rawId: string
  deviceName: string
}

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
): LegacyDevice[] => {
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

const normalizeDeviceRequest = (device: LegacyDevice): AccessPointRequest => {
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

/** @deprecated FIXME: move to integration layer */
export const useDevices = () => {
  const [devices, setDevices] = useAtom(devicesAtom)
  const [recoveryDevices, setRecoveryDevices] = useAtom(recoveryDevicesAtom)

  const {
    newDeviceName,
    browser: { name: browserName },
  } = useDeviceInfo()

  const { profile } = useAccount()

  const handleLoadDevices = React.useCallback(async () => {
    if (profile?.anchor) {
      const [accessPoints, existingDevices] = await Promise.all([
        im.read_access_points().catch((e) => {
          throw new Error(
            `useDevices.handleLoadDevices im.read_access_points: ${e.message}`,
          )
        }),
        fetchAuthenticatorDevices(BigInt(profile?.anchor)),
      ])

      const normalizedDevices = normalizeDevices(
        existingDevices,
        accessPoints?.data[0],
      )

      setDevices(normalizedDevices)
    }
  }, [profile?.anchor, setDevices])

  const updateDevice = React.useCallback(
    async (device: LegacyDevice) => {
      const normalizedDevice = normalizeDeviceRequest(device)

      if (!device.isAccessPoint) {
        const createAccessPointResponse = await im
          .create_access_point(normalizedDevice)
          .catch((e) => {
            throw new Error(
              `useDevices.updateDevice im.create_access_point: ${e.message}`,
            )
          })
        handleLoadDevices()
        return createAccessPointResponse
      }
      const updatedAccessPoint = await im
        .update_access_point(normalizedDevice)
        .catch((e) => {
          throw new Error(
            `useDevices.updateDevice im.update_access_point: ${e.message}`,
          )
        })
      handleLoadDevices()
      return updatedAccessPoint
    },
    [handleLoadDevices],
  )

  const getRecoveryDevices = React.useCallback(async () => {
    if (profile?.anchor) {
      const [accessPoints, existingRecoveryDevices] = await Promise.all([
        im.read_access_points().catch((e) => {
          throw new Error(
            `useDevices.getRecoveryDevices im.read_access_points: ${e.message}`,
          )
        }),
        fetchRecoveryDevices(BigInt(profile?.anchor)),
      ])

      const normalizedDevices = normalizeRecoveryDevices(
        existingRecoveryDevices,
        accessPoints?.data[0],
      )

      setRecoveryDevices(normalizedDevices)
    }
  }, [profile?.anchor, setRecoveryDevices])

  const deleteDevice = React.useCallback(
    async (pubkey: PublicKey) => {
      if (authState.get().actor && profile?.anchor) {
        await Promise.all([
          removeDevice(BigInt(profile?.anchor), pubkey),
          im.remove_access_point({ pub_key: pubkey }).catch((e) => {
            throw new Error(
              `useDevices.deleteDevice im.remove_access_point: ${e.message}`,
            )
          }),
        ])
      }
    },
    [profile?.anchor],
  )

  const createWebAuthNDevice = React.useCallback(
    async (userNumber: bigint): Promise<{ device: WebAuthnDevice }> => {
      const existingDevices = await fetchAllDevices(userNumber)

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
      if (!authState.get().actor)
        throw new Error("useDevices.createDevice Unauthorized")

      const pub_key = fromHexString(publicKey)

      await Promise.all([
        addDevice(
          userNumber,
          deviceName,
          { unknown: null },
          { authentication: null },
          derFromPubkey(Array.from(new Uint8Array(pub_key))),
          fromHexString(rawId),
        ),
        im
          .create_access_point({
            icon: "",
            device: deviceName,
            browser: browserName ?? "",
            pub_key: Array.from(new Uint8Array(pub_key)),
          })
          .catch((e) => {
            throw new Error(
              `useDevices.createDevice im.create_access_point: ${e.message}`,
            )
          }),
      ])
    },
    [browserName],
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

      return await im.create_access_point(newDevice).catch((e) => {
        throw new Error(
          `useDevices.createRecoveryDevice im.create_access_point: ${e.message}`,
        )
      })
    },
    [],
  )

  const recoverDevice = React.useCallback(
    async (userNumber: number) => {
      try {
        if (!authState.get().actor)
          throw new Error(
            "useDevices.recoverDevice Unauthorized authState.get().actor is undefined",
          )
        const { device } = await createWebAuthNDevice(BigInt(userNumber))

        await createDevice({
          ...device,
          userNumber: BigInt(userNumber),
        })

        return {
          message: "Device created successfully",
        }
      } catch (error: any) {
        if (error.message === ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST) {
          return {
            message: "This device is already registered",
          }
        }
        throw error
      }
    },
    [createDevice, createWebAuthNDevice],
  )

  const getDevices = React.useCallback(async () => {
    await handleLoadDevices()
  }, [handleLoadDevices])

  const createRecoveryPhrase = React.useCallback(async () => {
    if (!profile?.anchor)
      throw new Error("useDevice.createRecoveryPhrase profile?.anchor missing")
    if (!authState.get().actor)
      throw new Error("useDevice.createRecoveryPhrase internetIdentity missing")

    const recovery = generate().trim()
    const recoverIdentity = await fromMnemonicWithoutValidation(
      recovery,
      IC_DERIVATION_PATH,
    )
    const deviceName = "Recovery phrase"

    // TODO: store as access point
    await addDevice(
      BigInt(profile.anchor),
      deviceName,
      { seed_phrase: null },
      { recovery: null },
      recoverIdentity.getPublicKey().toDer(),
    )
    createRecoveryDevice(
      new Blob([recoverIdentity.getPublicKey().toDer()]),
      "document",
      deviceName,
    )
    getRecoveryDevices()
    return `${profile.anchor} ${recovery}`
  }, [createRecoveryDevice, getRecoveryDevices, profile?.anchor])

  const createSecurityDevice = React.useCallback(
    async (
      userNumberOverwrite?: bigint,
      purpose: "recover" | "authentication" = "recover",
    ) => {
      const actualUserNumber = profile?.anchor || userNumberOverwrite
      if (!actualUserNumber)
        throw new Error("useDevice.createSecurityDevice userNumber missing")
      if (!authState.get().actor)
        throw new Error(
          "useDevice.createSecurityDevice internetIdentity missing",
        )

      const devices = await fetchAllDevices(BigInt(actualUserNumber))
      const deviceName = "Security Key"

      let recoverIdentity
      try {
        recoverIdentity = await WebAuthnIdentity.create({
          publicKey: creationOptions(devices, "cross-platform"),
        })
        await Promise.all([
          addDevice(
            BigInt(actualUserNumber),
            deviceName,
            { cross_platform: null },
            purpose && purpose === "recover"
              ? { recovery: null }
              : { authentication: null },
            recoverIdentity.getPublicKey().toDer(),
            recoverIdentity.rawId,
          ),
          createRecoveryDevice(
            new Blob([recoverIdentity.getPublicKey().toDer()]),
            "usb",
            deviceName,
          ),
        ])
      } catch (error: any) {
        if (error.message !== ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST) {
          throw error
        }
        console.debug("createSecurityDevice", "device already registered")
      }

      getRecoveryDevices()
      getDevices()
    },
    [createRecoveryDevice, getDevices, getRecoveryDevices, profile?.anchor],
  )

  const getGoogleDevice = React.useCallback(
    async ({ token }: { token?: string }) => {
      const response = await fetch(SIGNIN_GOOGLE, {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      return await response.json()
    },
    [],
  )

  React.useEffect(() => {
    handleLoadDevices()
  }, [profile?.anchor, handleLoadDevices])

  return {
    devices,
    recoveryDevices,
    createWebAuthNDevice,
    createRecoveryPhrase,
    createSecurityDevice,
    getGoogleDevice,
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

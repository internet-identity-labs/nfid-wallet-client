import {
  fromHexString,
  toHexString,
} from "@dfinity/candid/lib/cjs/utils/buffer"
import { WebAuthnIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import React from "react"

import { im, Icon } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import {
  AccessPointRequest,
  AccessPointResponse,
} from "frontend/integration/_ic_api/identity_manager.d"
import { DeviceData } from "frontend/integration/_ic_api/internet_identity.d"
import { useDeviceInfo } from "frontend/integration/device"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"
import {
  addDevice,
  fetchAllDevices,
  fetchAuthenticatorDevices,
  fetchRecoveryDevices,
  IC_DERIVATION_PATH,
} from "frontend/integration/internet-identity"
import { fromMnemonicWithoutValidation } from "frontend/integration/internet-identity/crypto/ed25519"
import { generate } from "frontend/integration/internet-identity/crypto/mnemonic"
import { derFromPubkey } from "frontend/integration/internet-identity/utils"
import { creationOptions } from "frontend/integration/webauthn/creation-options"

import { useAccount } from "../account/hooks"

import { LegacyDevice, RecoveryDevice } from "./state"

export interface WebAuthnDevice {
  publicKey: string
  rawId: string
  deviceName: string
}

const getIcon = (device: DeviceData): Icon => {
  switch (device.alias.split(" ")[3]) {
    case "Android":
    case "iOS":
      return Icon.mobile
    case "Mac OS":
      return Icon.desktop
    default:
      return Icon.laptop
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
      isSecurityKey:
        Object.keys(device.key_type).indexOf("cross_platform") > -1,
    }
  })
}

const normalizeDeviceRequest = (device: LegacyDevice): AccessPointRequest => {
  return {
    icon: device.icon,
    device: device.label,
    pub_key: Principal.selfAuthenticating(
      new Uint8Array(device.pubkey),
    ).toText(),
    browser: device.browser,
    device_type: { Unknown: null },
    credential_id: [],
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
    return Icon.document
  }
  if (accessPoint?.icon) {
    return accessPoint.icon as Icon
  }
  return Icon.usb
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
      isProtected: device.protection.hasOwnProperty("protected"),
    }
  })
}

async function fetchDevices(anchor: string) {
  console.log(">> fetchDevices", { anchor })

  const [accessPoints, existingDevices] = await Promise.all([
    im.read_access_points().catch((e) => {
      throw new Error(
        `useDevices.handleLoadDevices im.read_access_points: ${e.message}`,
      )
    }),
    fetchAuthenticatorDevices(BigInt(anchor)),
  ])
  console.debug("fetchDevices", { accessPoints, existingDevices })

  const normalizedDevices = normalizeDevices(
    existingDevices,
    accessPoints?.data[0],
  )
  console.debug("fetchDevices", { normalizedDevices })
  return normalizedDevices
}

async function fetchAccountRecoveryMethods(anchor: string) {
  console.debug("fetchAccountRecoveryMethods", { anchor })
  const [accessPoints, existingRecoveryDevices] = await Promise.all([
    im.read_access_points().catch((e) => {
      throw new Error(
        `useDevices.getRecoveryDevices im.read_access_points: ${e.message}`,
      )
    }),
    fetchRecoveryDevices(BigInt(anchor)),
  ])
  console.debug("fetchAccountRecoveryMethods", {
    accessPoints,
    existingRecoveryDevices,
  })

  const normalizedRecoveryDevices = normalizeRecoveryDevices(
    existingRecoveryDevices,
    accessPoints?.data[0],
  )
  console.debug("fetchAccountRecoveryMethods", {
    normalizedRecoveryDevices,
  })
  return normalizedRecoveryDevices
}

interface GoogleDeviceFilter {
  browser: string
}
interface WalletDeviceFilter {
  label: string
}

export const byGoogleDevice = ({ browser }: GoogleDeviceFilter) => {
  return browser.includes("google")
}

export const byWalletDevice = ({ label }: WalletDeviceFilter) => {
  const knownWalletDevices = ["Internet Identity"]
  return knownWalletDevices.indexOf(label) > -1
}

export const byNotGoogleDevice = ({ browser }: GoogleDeviceFilter) =>
  !byGoogleDevice({ browser })

export const byNotWalletDevice = ({ label }: WalletDeviceFilter) =>
  !byWalletDevice({ label })

export const useDevices = () => {
  const { profile } = useAccount()

  const {
    data: authenticatorDevices,
    error: authenticatorDevicesError,
    mutate: refreshDevices,
  } = useSWR(
    profile?.anchor ? [profile.anchor.toString(), "authenticator"] : null,
    ([anchor]) => fetchDevices(anchor),
    {
      dedupingInterval: 60_000 * 5,
      focusThrottleInterval: 60_000 * 5,
    },
  )

  const {
    data: recoveryDevices,
    error: fetchRecoveryDevicesError,
    mutate: refreshRecoveryDevices,
  } = useSWR(
    profile?.anchor ? [profile.anchor.toString(), "recovery"] : null,
    ([anchor]) => fetchAccountRecoveryMethods(anchor),
    {
      dedupingInterval: 60_000 * 5,
      focusThrottleInterval: 60_000 * 5,
    },
  )

  const socialDevices = React.useMemo(() => {
    return (
      authenticatorDevices?.filter(byGoogleDevice).map((socialDevice) => ({
        ...socialDevice,
        // TODO: move to normalizer
        icon: "google" as Icon,
        label: "Google",
        isAccessPoint: true,
        isSocialDevice: true,
      })) ?? []
    )
  }, [authenticatorDevices])

  const walletDevices = React.useMemo(() => {
    return (
      authenticatorDevices?.filter(byWalletDevice).map((walletDevice) => ({
        ...walletDevice,
        isAccessPoint: true,
        isWalletDevice: true,
      })) ?? []
    )
  }, [authenticatorDevices])

  // TODO replace by having social device like separate device type (as recover)
  const devices = React.useMemo(() => {
    return authenticatorDevices
      ?.filter(byNotGoogleDevice)
      ?.filter(byNotWalletDevice)
  }, [authenticatorDevices])

  const {
    newDeviceName,
    browser: { name: browserName },
  } = useDeviceInfo()

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
        refreshDevices()
        return createAccessPointResponse
      }
      const updatedAccessPoint = await im
        .update_access_point(normalizedDevice)
        .catch((e) => {
          throw new Error(
            `useDevices.updateDevice im.update_access_point: ${e.message}`,
          )
        })
      refreshDevices()
      return updatedAccessPoint
    },
    [refreshDevices],
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
            pub_key: Principal.selfAuthenticating(
              new Uint8Array(pub_key),
            ).toText(),
            device_type: { Unknown: null },
            credential_id: [],
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
      const newDevice: AccessPointRequest = {
        icon: icon ?? "document",
        device: device ?? "Recovery Phrase",
        browser: "",
        pub_key: Principal.selfAuthenticating(
          new Uint8Array(await recoverIdentity.arrayBuffer()),
        ).toText(),
        device_type: { Recovery: null },
        credential_id: [],
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
        const { device } = await createWebAuthNDevice(BigInt(userNumber))

        await createDevice({
          ...device,
          userNumber: BigInt(userNumber),
        })

        refreshRecoveryDevices()
        refreshDevices()

        return {
          message: "Device created successfully",
        }
      } catch (error: any) {
        if (ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(error.message)) {
          return {
            message: "This device is already registered",
          }
        }
        throw error
      }
    },
    [
      createDevice,
      createWebAuthNDevice,
      refreshDevices,
      refreshRecoveryDevices,
    ],
  )

  /**
   * NEVER LOG THE RECOVERY PHRASE TO CONSOLE OR SEND
   * TO EXTERNAL SERVICE
   */
  const createRecoveryPhrase = React.useCallback(
    async (protect = true) => {
      if (!profile?.anchor)
        throw new Error(
          "useDevice.createRecoveryPhrase profile?.anchor missing",
        )

      // NOTE: NEVER LOG RECOVERY PHRASE
      const recovery = generate().trim()
      const recoverIdentity = await fromMnemonicWithoutValidation(
        recovery,
        IC_DERIVATION_PATH,
      )
      const deviceName = "Recovery phrase"

      await Promise.all([
        addDevice(
          BigInt(profile?.anchor),
          deviceName,
          { seed_phrase: null },
          { recovery: null },
          recoverIdentity.getPublicKey().toDer(),
          undefined as any,
          protect,
        ),
        createRecoveryDevice(
          new Blob([recoverIdentity.getPublicKey().toDer()]),
          "document",
          deviceName,
        ),
      ])
      refreshRecoveryDevices()
      refreshDevices()
      return `${profile.anchor} ${recovery}`
    },
    [
      createRecoveryDevice,
      refreshDevices,
      refreshRecoveryDevices,
      profile?.anchor,
    ],
  )

  const createSecurityDevice = React.useCallback(
    async (
      userNumberOverwrite?: bigint,
      purpose: "recover" | "authentication" = "recover",
    ) => {
      const actualUserNumber = profile?.anchor || userNumberOverwrite
      if (!actualUserNumber)
        throw new Error("useDevice.createSecurityDevice userNumber missing")

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
        if (!ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(error.message)) {
          throw error
        }
        console.debug("createSecurityDevice", "device already registered")
      }
      refreshRecoveryDevices()
      refreshDevices()
    },
    [
      createRecoveryDevice,
      refreshDevices,
      refreshRecoveryDevices,
      profile?.anchor,
    ],
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

  return {
    loadingDevices: !devices && !authenticatorDevicesError,
    devices: devices || [],
    socialDevices,
    walletDevices,
    loadingRecoveryDevices: !recoveryDevices && !fetchRecoveryDevicesError,
    recoveryDevices: recoveryDevices || [],
    hasSecurityKey:
      !!authenticatorDevices?.find((d) => d.isSecurityKey) ||
      !!recoveryDevices?.find((d) => d.isSecurityKey),
    createWebAuthNDevice,
    createRecoveryPhrase,
    createSecurityDevice,
    getGoogleDevice,
    getDevices: refreshDevices,
    getRecoveryDevices: refreshRecoveryDevices,
    createDevice,
    createRecoveryDevice,
    recoverDevice,
    updateDevice,
  }
}

import {
  fromHexString,
  toHexString,
} from "@dfinity/candid/lib/cjs/utils/buffer"
import { WebAuthnIdentity } from "@dfinity/identity"
import bowser from "bowser"

import { im } from "frontend/integration/actors"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"
import {
  addDevice,
  authState,
  creationOptions,
  fetchAllDevices,
} from "frontend/integration/internet-identity"
import { derFromPubkey } from "frontend/integration/internet-identity/utils"
import { getPlatformInfo } from "frontend/ui/utils"

import { WebAuthnDevice } from "./types"

const createRecoveryDevice = async (
  recoverIdentity: Blob,
  icon?: string,
  device?: string,
) => {
  const newDevice = {
    icon: icon ?? "document",
    device: device ?? "Recovery Phrase",
    browser: "",
    pub_key: Array.from(new Uint8Array(await recoverIdentity.arrayBuffer())),
  }

  return await im.create_access_point(newDevice).catch((e) => {
    throw new Error(
      `useDevices.createRecoveryDevice im.create_access_point: ${e.message}`,
    )
  })
}

const createWebAuthNDevice = async (
  userNumber: bigint,
): Promise<{ device: WebAuthnDevice }> => {
  const existingDevices = await fetchAllDevices(userNumber)

  const identity = await WebAuthnIdentity.create({
    publicKey: creationOptions(existingDevices),
  })
  const publicKey = toHexString(identity.getPublicKey().toDer())
  const rawId = toHexString(identity.rawId)

  const device = {
    publicKey,
    rawId,
    deviceName: `NFID browser on ${getPlatformInfo().os}`,
  }

  return { device }
}

const createDevice = async ({
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
  const parser = bowser.getParser(window.navigator.userAgent)
  const browser = parser.getBrowser()

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
        browser: browser.name ?? "",
        pub_key: Array.from(new Uint8Array(pub_key)),
      })
      .catch((e) => {
        throw new Error(
          `useDevices.createDevice im.create_access_point: ${e.message}`,
        )
      }),
  ])
}

export const RegisterDeviceWithSecurityKey = async () => {
  const actualUserNumber = Number(authState.get().actor)
  if (!actualUserNumber)
    throw new Error("useDevice.createSecurityDevice internetIdentity missing")

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
        { authentication: null },
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
}

export const registerDeviceWithWebAuthn = async (userNumber: number) => {
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
}

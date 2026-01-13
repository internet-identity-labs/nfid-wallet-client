import { WebAuthnIdentity } from "@dfinity/identity"

import { ii, im, setProfileToStorage } from "@nfid/integration"
import { getIsMobileDeviceMatch } from "@nfid/ui/utils/is-mobile"

import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "../identity"
import { fetchProfile } from "../identity-manager"
import { fetchAuthenticatorDevices } from "../internet-identity"
import { creationOptions } from "../webauthn/creation-options"

import { deviceInfo, fetchWebAuthnPlatformCapability } from "."

export async function isMobileWithWebAuthn() {
  console.debug("isMobileWithWebAuthn call fetchWebAuthnCapability")
  return (await fetchWebAuthnPlatformCapability()) && getIsMobileDeviceMatch()
}

export async function addDeviceToIIandIM(
  identity: WebAuthnIdentity,
  anchor: bigint,
  isSecurityKey: boolean,
) {
  try {
    const credential_id = Array.from(new Uint8Array(identity.rawId))
    await Promise.all([
      ii
        .add(anchor, {
          alias: deviceInfo.newDeviceName,
          pubkey: Array.from(new Uint8Array(identity.getPublicKey().toDer())),
          credential_id: [credential_id],
          key_type: isSecurityKey
            ? { cross_platform: null }
            : { platform: null },
          purpose: { authentication: null },
          protection: { unprotected: null },
        })
        .catch((e) => {
          throw new Error(`addDeviceToIIandIM ii.add: ${e.message}`)
        }),
      im
        .create_access_point({
          icon: "",
          device: deviceInfo.newDeviceName,
          browser: deviceInfo.browser.name ?? "",
          pub_key: identity.getPrincipal().toText(),
          device_type: { Unknown: null },
          credential_id: [],
        })
        .catch((e) => {
          throw new Error(
            `addDeviceToIIandIM im.create_access_point: ${e.message}`,
          )
        }),
    ])
  } catch (e: any) {
    console.error("addDeviceToIIandIM", { message: e.message })
    if (!ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(e.message)) {
      throw e
    }
    console.debug("addDeviceToIIandIM", "device already registered")
  }
}

export async function registerDeviceWithWebAuthn() {
  const profile = await fetchProfile()
  const usersAuthenticatorDevices = await fetchAuthenticatorDevices(
    BigInt(profile.anchor),
  )
  console.debug("registerDeviceWithWebAuthn", { usersAuthenticatorDevices })

  try {
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(usersAuthenticatorDevices),
    })
    await addDeviceToIIandIM(identity, BigInt(profile.anchor), false)
  } catch (e: any) {
    console.error("registerDeviceWithWebAuthn", { message: e.message })
    if (!ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(e.message)) {
      throw e
    }
    console.debug("registerDeviceWithWebAuthn", "device already registered")
  }
  return setProfileToStorage(profile)
}

export async function registerDeviceWithSecurityKey() {
  const profile = await fetchProfile()
  const usersAuthenticatorDevices = await fetchAuthenticatorDevices(
    BigInt(profile.anchor),
  )
  // TODO: this could fail if the device is already registered but
  // lost profile form storage
  try {
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(usersAuthenticatorDevices, "cross-platform"),
    })
    await addDeviceToIIandIM(identity, BigInt(profile.anchor), true)
  } catch (e: any) {
    console.error("registerDeviceWithSecurityKey", { message: e.message })
    if (!ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(e.message)) {
      throw e
    }
    console.debug("registerDeviceWithSecurityKey", "device already registered")
  }
}

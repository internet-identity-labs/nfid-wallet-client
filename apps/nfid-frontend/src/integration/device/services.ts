import { WebAuthnIdentity } from "@dfinity/identity"

import { ii, im, setProfile } from "@nfid/integration"

import {
  deviceInfo,
  fetchWebAuthnPlatformCapability,
  getIsMobileDeviceMatch,
} from "."
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "../identity"
import { fetchProfile } from "../identity-manager"
import { fetchAuthenticatorDevices } from "../internet-identity"
import { creationOptions } from "../webauthn/creation-options"

export async function isMobileWithWebAuthn() {
  console.debug("isMobileWithWebAuthn call fetchWebAuthnCapability")
  return (await fetchWebAuthnPlatformCapability()) && getIsMobileDeviceMatch()
}

// NOTE: Maybe this should live somewhere else?
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
    const credential_id = Array.from(new Uint8Array(identity.rawId))
    await Promise.all([
      ii
        .add(BigInt(profile.anchor), {
          alias: deviceInfo.newDeviceName,
          pubkey: Array.from(new Uint8Array(identity.getPublicKey().toDer())),
          credential_id: [credential_id],
          key_type: { platform: null },
          purpose: { authentication: null },
          protection: { unprotected: null },
        })
        .catch((e) => {
          throw new Error(`registerDeviceWithWebAuthn ii.add: ${e.message}`)
        }),
      im
        .create_access_point({
          icon: "",
          device: deviceInfo.newDeviceName,
          browser: deviceInfo.browser.name ?? "",
          pub_key: identity.getPrincipal().toText(),
        })
        .catch((e) => {
          throw new Error(
            `registerDeviceWithWebAuthn im.create_access_point: ${e.message}`,
          )
        }),
    ])
  } catch (e: any) {
    console.error("registerDeviceWithWebAuthn", { message: e.message })
    if (!ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(e.message)) {
      throw e
    }
    console.debug("registerDeviceWithWebAuthn", "device already registered")
  }
  setProfile(profile)
}

// NOTE: Maybe this should live somewhere else?
export async function registerDeviceWithSecurityKey() {
  const profile = await fetchProfile()
  const usersAuthenticatorDevices = await fetchAuthenticatorDevices(
    BigInt(profile.anchor),
  )
  // TODO: this could fail if the device is already registered but
  // lost profile form localStorage
  try {
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(usersAuthenticatorDevices, "cross-platform"),
    })
    const credential_id = Array.from(new Uint8Array(identity.rawId))
    await Promise.all([
      ii
        .add(BigInt(profile.anchor), {
          alias: deviceInfo.newDeviceName,
          // pubkey: Array.from(new Uint8Array(newPublicKey)),
          pubkey: Array.from(new Uint8Array(identity.getPublicKey().toDer())),
          credential_id: [credential_id],
          key_type: { cross_platform: null },
          purpose: { authentication: null },
          protection: { unprotected: null },
        })
        .catch((e) => {
          throw new Error(`registerDeviceWithSecurityKey ii.add: ${e.message}`)
        }),
      im
        .create_access_point({
          icon: "usb",
          device: "Security Key",
          browser: "",
          pub_key: identity.getPrincipal().toText(),
        })
        .catch((e) => {
          throw new Error(
            `registerDeviceWithSecurityKey im.create_access_point: ${e.message}`,
          )
        }),
    ])
  } catch (e: any) {
    console.error("registerDeviceWithSecurityKey", { message: e.message })
    if (!ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(e.message)) {
      throw e
    }
    console.debug("registerDeviceWithSecurityKey", "device already registered")
  }
}

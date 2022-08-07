import { WebAuthnIdentity } from "@dfinity/identity"
import { toast } from "react-toastify"

import { errorMessages } from "frontend/errors"

import { deviceInfo, fetchWebAuthnCapability, getIsMobileDeviceMatch } from "."
import { ii, im } from "../actors"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "../identity"
import { fetchProfile } from "../identity-manager"
import { setProfile } from "../identity-manager/profile"
import {
  creationOptions,
  fetchAuthenticatorDevices,
} from "../internet-identity"

export async function isMobileWithWebAuthn() {
  console.debug("isMobileWithWebAuthn call fetchWebAuthnCapability")
  return (await fetchWebAuthnCapability()) && getIsMobileDeviceMatch()
}

// NOTE: Maybe this should live somewhere else?
export async function registerDeviceWithWebAuthn() {
  const profile = await fetchProfile()
  const usersAuthenticatorDevices = await fetchAuthenticatorDevices(
    BigInt(profile.anchor),
  )
  try {
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(usersAuthenticatorDevices),
    })
    const credential_id = Array.from(new Uint8Array(identity.rawId))
    const pubKey = Array.from(new Uint8Array(identity.getPublicKey().toDer()))
    await Promise.all([
      ii
        .add(BigInt(profile.anchor), {
          alias: deviceInfo.newDeviceName,
          pubkey: pubKey,
          credential_id: [credential_id],
          key_type: { platform: null },
          purpose: { authentication: null },
          protection: { unprotected: null },
        })
        .catch((e) => {
          toast.error(errorMessages.deviceRegister)
          throw new Error(`registerDeviceWithWebAuthn ii.add: ${e.message}`)
        }),
      im
        .create_access_point({
          icon: "",
          device: deviceInfo.newDeviceName,
          browser: deviceInfo.browser.name ?? "",
          pub_key: pubKey,
        })
        .catch((e) => {
          toast.error(errorMessages.createAccessPoint)

          throw new Error(
            `registerDeviceWithWebAuthn im.create_access_point: ${e.message}`,
          )
        }),
    ])
  } catch (e: any) {
    if (e.message !== ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST) {
      toast.error(e)
      throw e
    }

    toast.error(errorMessages.deviceAlreadyRegistered)
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
    const pubKey = Array.from(new Uint8Array(identity.getPublicKey().toDer()))
    await Promise.all([
      ii
        .add(BigInt(profile.anchor), {
          alias: deviceInfo.newDeviceName,
          // pubkey: Array.from(new Uint8Array(newPublicKey)),
          pubkey: pubKey,
          credential_id: [credential_id],
          key_type: { cross_platform: null },
          purpose: { authentication: null },
          protection: { unprotected: null },
        })
        .catch((e) => {
          toast.error(errorMessages.deviceRegister)

          throw new Error(`registerDeviceWithSecurityKey ii.add: ${e.message}`)
        }),
      im
        .create_access_point({
          icon: "usb",
          device: "Security Key",
          browser: "",
          pub_key: pubKey,
        })
        .catch((e) => {
          toast.error(errorMessages.createAccessPoint)

          throw new Error(
            `registerDeviceWithSecurityKey im.create_access_point: ${e.message}`,
          )
        }),
    ])
  } catch (e: any) {
    if (e.message !== ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST) {
      toast.error(e)
      throw e
    }
    toast.error(errorMessages.deviceAlreadyRegistered)
    console.debug(
      registerDeviceWithSecurityKey.name,
      "device already registered",
    )
  }
}

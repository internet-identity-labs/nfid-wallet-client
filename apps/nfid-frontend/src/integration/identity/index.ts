import { WebAuthnIdentity } from "@dfinity/identity"

import { DeviceData } from "../_ic_api/internet_identity.d"
import { fetchProfile } from "../identity-manager"
import { Device, fetchAuthenticatorDevices } from "../internet-identity"
import { creationOptions, getCredentials } from "../webauthn/creation-options"
import { MultiWebAuthnIdentity } from "./multiWebAuthnIdentity"

/**
 * Creates an identity authorized to call internet identity canister by looping through device
 * credentials associated with an anchor to find a credential provided by the current device.
 * @param devices List of devices retrieved from ii.lookup
 * @param withSecurityDevices Flag to include security devices
 * @returns
 */
export function identityFromDeviceList(
  devices: Device[],
  withSecurityDevices?: boolean,
): MultiWebAuthnIdentity {
  return MultiWebAuthnIdentity.fromCredentials(
    getCredentials(devices),
    withSecurityDevices,
  )
}

export const ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST = [
  "The user attempted to register an authenticator that contains one of the credentials already registered with the relying party.",
  "At least one credential matches an entry of the excludeCredentials list in the platform attached authenticator.",
  "An attempt was made to use an object that is not, or is no longer, usable",
  "The object is in an invalid state.",
]

/**
 * Create a new WebAuthnIdentity. Used during registration of a new NFID.
 * @returns WebAuthnIdentity
 */
export async function createWebAuthnIdentity() {
  return await WebAuthnIdentity.create({
    publicKey: creationOptions(),
  })
}

export const includesSecurityKey = (device: DeviceData[]) =>
  device.findIndex((x) => "cross_platform" in x.key_type) >= 0

export async function hasSecurityKeyService() {
  const profile = await fetchProfile()
  console.debug("hasSecurityKey", { profile })
  const usersAuthenticatorDevices = await fetchAuthenticatorDevices(
    BigInt(profile.anchor),
    true,
  )
  const hasSecurityKey = includesSecurityKey(usersAuthenticatorDevices)
  console.debug("hasSecurityKey", {
    usersAuthenticatorDevices,
    hasSecurityKey,
  })
  return hasSecurityKey
}

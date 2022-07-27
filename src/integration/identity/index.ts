import { WebAuthnIdentity } from "@dfinity/identity"
import { Buffer } from "buffer"

import { creationOptions, Device } from "../internet-identity"
import { derFromPubkey } from "../internet-identity/utils"
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
  const credential = devices
    .filter((device) => !!device.credentialId)
    .map((device) => ({
      pubkey: derFromPubkey(device.pubkey),
      credentialId: Buffer.from(device.credentialId!),
    }))
  return MultiWebAuthnIdentity.fromCredentials(credential, withSecurityDevices)
}

export const ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST =
  "The user attempted to register an authenticator that contains one of the credentials already registered with the relying party."

/**
 * Create a new WebAuthnIdentity. Used during registration of a new NFID.
 * @returns WebAuthnIdentity
 */
export async function createWebAuthnIdentity() {
  return await WebAuthnIdentity.create({
    publicKey: creationOptions(),
  })
}

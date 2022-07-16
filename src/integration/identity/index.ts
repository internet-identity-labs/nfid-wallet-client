import { WebAuthnIdentity } from "@dfinity/identity"

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
  return MultiWebAuthnIdentity.fromCredentials(
    devices
      .filter((device) => !!device.credentialId)
      .map((device) => ({
        pubkey: derFromPubkey(device.pubkey),
        credentialId: (device.credentialId as Uint8Array).buffer,
      })),
    withSecurityDevices,
  )
}

/**
 * Create a new WebAuthnIdentity. Used during registration of a new NFID.
 * @returns WebAuthnIdentity
 */
export async function createWebAuthnIdentity() {
  return await WebAuthnIdentity.create({
    publicKey: creationOptions(),
  })
}

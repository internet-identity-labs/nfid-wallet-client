import { DerEncodedPublicKey } from "@dfinity/agent"

import { DeviceKey } from "frontend/integration/_ic_api/internet_identity_types"

export const derFromPubkey = (pubkey: DeviceKey): DerEncodedPublicKey =>
  new Uint8Array(pubkey).buffer as DerEncodedPublicKey

// A `hasOwnProperty` that produces evidence for the typechecker
export function hasOwnProperty<
  X extends Record<string, unknown>,
  Y extends PropertyKey,
>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

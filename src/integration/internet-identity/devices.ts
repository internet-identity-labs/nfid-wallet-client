import { DerEncodedPublicKey } from "@dfinity/agent"

import { ii } from "frontend/comm/actors"
import {
  Purpose,
  UserNumber,
  KeyType,
} from "frontend/comm/idl/internet_identity_types"
import { hasOwnProperty } from "frontend/comm/services/internet-identity/utils"

export async function fetchAllDevices(anchor: UserNumber) {
  return await ii.lookup(anchor)
}

export async function fetchAuthenticatorDevices(
  anchor: UserNumber,
  withSecurityDevices?: boolean,
) {
  const allDevices = await ii.lookup(anchor)

  return allDevices.filter((device) =>
    withSecurityDevices
      ? true
      : hasOwnProperty(device.purpose, "authentication"),
  )
}

export async function fetchRecoveryDevices(anchor: UserNumber) {
  const allDevices = await ii.lookup(anchor)
  return allDevices.filter((device) =>
    hasOwnProperty(device.purpose, "recovery"),
  )
}

export async function addDevice(
  anchor: UserNumber,
  alias: string,
  keyType: KeyType,
  purpose: Purpose,
  newPublicKey: DerEncodedPublicKey,
  credentialId?: ArrayBuffer,
) {
  return await ii.add(anchor, {
    alias,
    pubkey: Array.from(new Uint8Array(newPublicKey)),
    credential_id: credentialId
      ? [Array.from(new Uint8Array(credentialId))]
      : [],
    key_type: keyType,
    purpose,
    protection: { unprotected: null },
  })
}

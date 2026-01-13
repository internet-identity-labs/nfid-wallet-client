import { PublicKey } from "@dfinity/agent"

import { DeviceData } from "../_ic_api/internet_identity.d"

export const createDeviceFactory = (
  alias: string,
  publicKey: PublicKey,
): DeviceData => {
  return {
    alias,
    protection: {
      unprotected: null,
    },
    pubkey: Array.from(new Uint8Array(publicKey.toDer())),
    key_type: {
      platform: null,
    },
    purpose: {
      authentication: null,
    },
    credential_id: [],
  }
}

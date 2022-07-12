import { DerEncodedPublicKey } from "@dfinity/agent"

import { DeviceKey } from "frontend/comm/idl/internet_identity_types"

export const derFromPubkey = (pubkey: DeviceKey): DerEncodedPublicKey =>
  new Uint8Array(pubkey).buffer as DerEncodedPublicKey

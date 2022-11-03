export const DEVICE_DATA_MOCK = [
  {
    alias: "NFID Chrome on Windows",
    protection: { unprotected: null },
    pubkey: [48, 42, 48, 5],
    key_type: { unknown: null },
    purpose: { authentication: null },
    // NOTE: invalid credential_id existing in our registered II devices
    credential_id: [{}],
  },
  {
    alias: "NFID Chrome on Android",
    protection: { unprotected: null },
    pubkey: [48, 94, 48, 12],
    key_type: { platform: null },
    purpose: { authentication: null },
    credential_id: [[1, 199, 117, 107]],
  },
]

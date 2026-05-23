import { Principal } from "@icp-sdk/core/principal"

export const getPrincipalId = (pubkey: Array<number>): string | undefined => {
  try {
    return Principal.selfAuthenticating(new Uint8Array(pubkey)).toText()
  } catch (e) {
    console.warn("getPrincipalId: failed to get principalId", e)
    return
  }
}

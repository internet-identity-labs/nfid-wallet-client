import { Ed25519KeyIdentity } from "@dfinity/identity"

export const getPrincipalId = (pubkey: Array<number>): string | undefined => {
  try {
    const pubkeyHex = Buffer.from(pubkey).toString("hex")
    const key = Ed25519KeyIdentity.fromParsedJson([pubkeyHex, ""])
    return key.getPrincipal().toString()
  } catch (e) {
    console.warn("getPrincipalId: failed to get principalId", e)
    return
  }
}

import { IdentityClientAuthEvent } from "."

export function mockIdentityClientAuthEvent(): IdentityClientAuthEvent {
  return {
    kind: "authorize-client",
    maxTimeToLive: BigInt(0),
    sessionPublicKey: new Uint8Array(),
  }
}

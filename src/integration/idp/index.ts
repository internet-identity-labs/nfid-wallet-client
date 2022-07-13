import { SignedDelegation } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import { BuiltDelegate } from "../internet-identity/build-delegate"

type IdentityProviderReadyEvent = { kind: "ready" }
type IdentityProviderAuthResponseEvent = {
  kind: "authorize-client-success"
  delegations: BuiltDelegate
  userPublicKey: Uint8Array
}
type IdentityProviderEvents =
  | IdentityProviderReadyEvent
  | IdentityProviderAuthResponseEvent

export type IdentityClientAuthEvent = {
  kind: "authorize-client"
  maxTimeToLive: bigint
  sessionPublicKey: Uint8Array
}
type IdentityClientDeviceEvent = { kind: "new-device" }
type IdentityClientEvents = IdentityClientAuthEvent | IdentityClientDeviceEvent

export interface ClientIdentityDelegate {
  delegation: {
    pubkey: Uint8Array
    expiration: bigint
    targets: undefined
  }
  signature: Uint8Array
}

function opener() {
  if (!window.opener) throw new Error("Could not identify window opener.")
  return window.opener as Window
}

export function postMessageToClient<T extends IdentityProviderEvents>(
  event: T,
) {
  opener().postMessage(event, "*")
}

export function awaitMessageFromClient<T extends IdentityClientEvents>(
  event: T["kind"],
) {
  return new Promise<MessageEvent<T>>((res) => {
    opener().addEventListener("message", (message: MessageEvent<T>) => {
      if (message.data.kind === event) {
        res(message)
      }
    })
  })
}

export const prepareClientDelegate = (
  receivedDelegation: SignedDelegation,
): ClientIdentityDelegate => ({
  delegation: {
    pubkey: Uint8Array.from(receivedDelegation.delegation.pubkey),
    expiration: BigInt(receivedDelegation.delegation.expiration),
    targets: undefined,
  },
  signature: Uint8Array.from(receivedDelegation.signature),
})

/**
 * Identity provider flow proceeds as follows.
 * Client: A 3rd party app connecting an NFID identity.
 * Provider: The NFID identity provider frontend.
 * 1. Client -> Provider: Open
 * 2. Provider -> Client: Ready
 * 3. Client -> Provider: Request
 * 4. Provider -> Client: Response
 */

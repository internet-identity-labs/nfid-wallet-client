import { AuthorizingAppMeta } from "frontend/state/authorization"

import { SignedDelegation } from "../internet-identity"
import { BuiltDelegate } from "../internet-identity/build-delegate"

/**
 * Identity provider flow proceeds as follows.
 * Client: A 3rd party app connecting an NFID identity.
 * Provider: The NFID identity provider frontend.
 * 1. Client -> Provider: Open
 * 2. Provider -> Client: Ready
 * 3. Client -> Provider: Request
 * 4. Provider -> Client: Response
 */

/** Events we post from the provider */
type IdentityProviderReadyEvent = { kind: "authorize-ready" }
type IdentityProviderAuthResponseEvent = {
  kind: "authorize-client-success"
  delegations: BuiltDelegate[]
  userPublicKey: Uint8Array
}
type IdentityProviderEvents =
  | IdentityProviderReadyEvent
  | IdentityProviderAuthResponseEvent

/** Events we receive from the client */
export type IdentityClientAuthEvent = {
  kind: "authorize-client"
  maxTimeToLive: bigint
  sessionPublicKey: Uint8Array
  derivationOrigin?: string
}
type IdentityClientDeviceEvent = { kind: "new-device" }
type IdentityClientEvents = IdentityClientAuthEvent | IdentityClientDeviceEvent

/** Third party auth delegation format expected by @dfinity/auth-client */
export interface DfinityAuthClientDelegate {
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
  hostname: string = "*",
) {
  const origin = opener()
  origin.postMessage(event, hostname)
}

export function awaitMessageFromClient<T extends IdentityClientEvents>(
  event: T["kind"],
) {
  return new Promise<MessageEvent<T>>((res) => {
    window.addEventListener("message", (message: MessageEvent<T>) => {
      if (message.data.kind === event) {
        res(message)
      }
    })
  })
}

/**
 * Prepare third party auth delegation for transmission via window message channel.
 */
export const prepareClientDelegate = (
  receivedDelegation: SignedDelegation,
): DfinityAuthClientDelegate => ({
  delegation: {
    pubkey: Uint8Array.from(receivedDelegation.delegation.pubkey),
    expiration: receivedDelegation.delegation.expiration,
    targets: undefined,
  },
  signature: Uint8Array.from(receivedDelegation.signature),
})

/**
 * Retrieve application metadata provided in the query params
 * @returns application meta data (logo and name)
 */
export function getAppMetaFromQuery(): AuthorizingAppMeta {
  const params = new URLSearchParams(window.location.search)
  return {
    name: params.get("applicationName") || undefined,
    logo: params.get("applicationLogo") || undefined,
  }
}

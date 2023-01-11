import { AuthorizingAppMeta } from "frontend/state/authorization"

import { SignedDelegation } from "../internet-identity"
import { BuiltDelegate } from "../internet-identity/build-delegate"
import { hasOwnProperty } from "../internet-identity/utils"

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
  const opener = window.opener || window.parent
  if (!opener) throw new Error("Could not identify window opener.")
  return opener as Window
}

export function postMessageToClient<T extends IdentityProviderEvents>(
  event: T,
  hostname: string = "*",
) {
  const origin = opener()
  console.debug("postMessageToClient", { event, hostname })
  origin.postMessage(event, hostname)
}

export function awaitClientMessage<T>(
  isExpectedMessage: (message: MessageEvent<T>) => message is MessageEvent<T>,
) {
  return new Promise<MessageEvent<T>>((res) => {
    window.addEventListener("message", (message) => {
      if (isExpectedMessage(message)) {
        return res(message)
      }
      console.warn(
        `awaitClientMessage: Unexpected message: ${JSON.stringify(message)}`,
      )
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

export const isIdentityClientAuthEvent = (
  event: unknown,
): event is MessageEvent<IdentityClientAuthEvent> => {
  const msg = (event as any).data as unknown

  console.debug("isIdentityClientAuthEvent", { msg })

  if (typeof msg !== "object") {
    return false
  }

  if (msg === null) {
    return false
  }

  // Some extra conversions to take typescript by the hand
  // eslint-disable-next-line
  const tmp: {} = msg
  const obj: Record<string, unknown> = tmp

  if (!hasOwnProperty(obj, "kind") || obj.kind !== "authorize-client") {
    return false
  }

  if (
    !hasOwnProperty(obj, "sessionPublicKey") ||
    !(obj.sessionPublicKey instanceof Uint8Array)
  ) {
    return false
  }

  const maxTimeToLive = obj.maxTimeToLive
  if (
    typeof maxTimeToLive !== "undefined" &&
    typeof maxTimeToLive !== "bigint"
  ) {
    return false
  }

  const derivationOrigin = obj.derivationOrigin
  if (
    typeof derivationOrigin !== "undefined" &&
    typeof derivationOrigin !== "string"
  ) {
    return false
  }
  return true
}

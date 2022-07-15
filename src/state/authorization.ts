import { SignedDelegate } from "frontend/integration/internet-identity"

/**
 * An auth session, signed by the private keys in II, delegating signing authority for a
 * given anchor for a specific scope (i.e. a string combining persona and host) to the
 * session keys which the client has generated and provided to the identity provider.
 */
export interface ThirdPartyAuthSession {
  delegations: SignedDelegate[]
  userPublicKey: Uint8Array
}

/**
 * A request from a third party application to access the authority to sign messages on
 * behalf of the user for a given scope.
 */
export interface AuthorizationRequest {
  maxTimeToLive: number
  sessionPublicKey: Uint8Array
  hostname: string
}

/**
 * Metadata describing the application making an authorization request. Logo is an
 * absolute url.
 */
export interface AuthorizingAppMeta {
  name?: string
  logo?: string
}

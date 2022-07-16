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

/**
 * Generate scope string with host and persona. Omits persona salt for null or zero personas for parity with legacy II.
 * @param host the domain being connected to
 * @param persona number or null specifying the users persona
 * @returns
 */
export function getScope(host: string, persona?: number) {
  const withProtocol = !!host.match(/^http(s)?:\/\//) ? host : `https://${host}`
  return `${persona ? `${persona}@` : ""}${withProtocol}`
}

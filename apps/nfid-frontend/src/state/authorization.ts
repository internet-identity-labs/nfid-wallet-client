import { SignedDelegation } from "@nfid/integration"

/**
 * An auth session, signed by the private keys in II, delegating signing authority for a
 * given anchor for a specific scope (i.e. a string combining persona and host) to the
 * session keys which the client has generated and provided to the identity provider.
 */
export interface ThirdPartyAuthSession {
  scope: string
  anchor: number
  signedDelegation: SignedDelegation
  userPublicKey: Uint8Array
}

/**
 * A request from a third party application to access the authority to sign messages on
 * behalf of the user for a given scope.
 */
export interface AuthorizationRequest {
  maxTimeToLive: bigint
  sessionPublicKey: Uint8Array
  hostname: string
  derivationOrigin?: string
  targets?: string[]
}

/**
 * Metadata describing the application making an authorization request. Logo is an
 * absolute url.
 */
export interface AuthorizingAppMeta {
  name?: string
  logo?: string
  url?: string
}

/**
 * Generate scope string with host and persona. Omits persona salt for zero account for parity with legacy II.
 * @param aliasDomain the domain being connected to
 * @param accountId number or null specifying the users persona
 * @param derivationOrigin the derivation origin which should be used instead of alias domain
 */
export function getScope(
  aliasDomain: string,
  accountId: number,
  derivationOrigin?: string,
) {
  console.debug("getScope", {
    aliasDomain,
    persona: accountId,
    derivationOrigin,
  })
  const host = derivationOrigin || aliasDomain
  console.debug("getScope", { host })
  const hostWithProtocoll = !!host.match(/^http(s)?:\/\//)
    ? host
    : `https://${host}`
  return `${accountId ? `${accountId}@` : ""}${hostWithProtocoll}`
}

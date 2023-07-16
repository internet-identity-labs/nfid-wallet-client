import { ThirdPartyAuthSession, fetchDelegate } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { AuthorizationRequest } from "frontend/state/authorization"

import { passkeyConnector } from "./auth-selection/passkey-flow/services"

export async function getLegacyThirdPartyAuthSession(
  authRequest: AuthorizationRequest,
  selectedPersonaId?: string,
  targets: string[] = [],
): Promise<ThirdPartyAuthSession> {
  if (!authRequest) throw new Error("No auth request")
  const account = await fetchProfile()

  const scope = getScope(
    authRequest.hostname,
    Number(selectedPersonaId),
    authRequest.derivationOrigin,
  )

  const delegate = await fetchDelegate(
    account.anchor,
    scope,
    Array.from(authRequest.sessionPublicKey),
    authRequest.maxTimeToLive,
  )

  return delegate
}

/**
 * Generate scope string with host and persona. Omits persona salt for zero account for parity with legacy II.
 * @param aliasDomain the domain being connected to
 * @param accountId number or null specifying the users persona
 * @param derivationOrigin the derivation origin which should be used instead of alias domain
 */
export function getScope(
  aliasDomain: string,
  accountId?: number,
  derivationOrigin?: string,
) {
  console.debug("getScope", {
    aliasDomain,
    persona: accountId,
    derivationOrigin,
  })
  const host = derivationOrigin || aliasDomain

  const hostWithProtocol = !!host.match(/^http(s)?:\/\//)
    ? host
    : `https://${host}`

  return `${accountId ? `${accountId}@` : ""}${hostWithProtocol}`
}

export const checkIf2FAEnabled = async () => {
  const profile = await fetchProfile()
  return !!profile?.is2fa
}

export const get2FAAuthSession = async () => {
  return await passkeyConnector.loginWithPasskey()
}

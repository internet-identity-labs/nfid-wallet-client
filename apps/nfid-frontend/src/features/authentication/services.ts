import { ThirdPartyAuthSession, fetchDelegate } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"

import { AuthenticationContext } from "./root/root-machine"

export async function getThirdPartyAuthSession(
  context: AuthenticationContext,
): Promise<ThirdPartyAuthSession> {
  if (!context.authRequest) throw new Error("No auth request")
  const account = await fetchProfile()

  const scope = getScope(
    context.authRequest.hostname,
    Number(context?.selectedPersonaId),
    context.authRequest.derivationOrigin,
  )

  const delegate = await fetchDelegate(
    account.anchor,
    scope,
    Array.from(context.authRequest.sessionPublicKey),
    context.authRequest.maxTimeToLive,
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

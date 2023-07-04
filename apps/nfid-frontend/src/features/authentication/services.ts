import {
  ThirdPartyAuthSession,
  authState,
  fetchDelegate,
} from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { AuthorizationRequest } from "frontend/state/authorization"

export async function getThirdPartyAuthSession(
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

  const state = authState.get()

  if (!state.chain) throw new Error("No delegation chain")
  if (!state.sessionKey) throw new Error("No session key")

  // if (targets.length > 0) {
  //   const globalKeys = await getGlobalKeys(
  //     state.chain,
  //     state.sessionKey,
  //     authRequest.sessionPublicKey,
  //     authRequest.chain ?? Chain.IC,
  //     targets,
  //   )

  //   const delegation = globalKeys.delegations[0]

  //   return {
  //     scope: scope,
  //     anchor: account.anchor,
  //     signedDelegation: delegation,
  //     userPublicKey: authRequest.sessionPublicKey,
  //   }
  // }

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

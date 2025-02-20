import {
  DeviceType,
  ThirdPartyAuthSession,
  authState,
  fetchDelegate,
  im,
  replaceIdentity,
} from "@nfid/integration"

import { isWebAuthNSupported } from "frontend/integration/device"
import { fetchProfile } from "frontend/integration/identity-manager"
import { AuthorizationRequest } from "frontend/state/authorization"

import { securityConnector } from "../security/device-connector"
import { passkeyConnector } from "./auth-selection/passkey-flow/services"
import { AuthenticationContext } from "./root/root-machine"

export async function getLegacyThirdPartyAuthSession(
  authRequest: AuthorizationRequest,
  selectedPersonaId?: string,
): Promise<ThirdPartyAuthSession> {
  console.debug("getLegacyThirdPartyAuthSession", { authRequest })
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

export const checkIf2FAEnabled = async (context: AuthenticationContext) => {
  const profile = await fetchProfile()
  if (!profile?.is2fa) {
    replaceIdentity(context.authSession?.delegationIdentity!)
    return undefined
  }

  const { data: imDevices } = await im.read_access_points()
  if (!imDevices?.length) throw new Error("No devices found")

  const allowedPasskeys = imDevices[0]
    .filter(
      (d) => DeviceType.Passkey in d.device_type && d.credential_id[0]?.length,
    )
    .map((d) => d.credential_id[0]) as string[]

  await authState.logout(false)
  return { allowedPasskeys, email: profile?.email }
}

export const shouldShowPasskeys = async (context: AuthenticationContext) => {
  if (!isWebAuthNSupported() || context.isEmbed) return { showPasskeys: false }

  try {
    const hasPasskeys = await passkeyConnector.hasPasskeys()
    return { showPasskeys: !hasPasskeys }
  } catch (_) {
    return { showPasskeys: true }
  }
}

export const shouldShowPasskeysEvery6thTime = async (
  context: AuthenticationContext,
) => {
  if (!isWebAuthNSupported() || context.isEmbed) return { showPasskeys: false }

  if (Math.floor(Math.random() * 6) === 0) {
    try {
      const hasPasskeys = await passkeyConnector.hasPasskeys()
      return { showPasskeys: !hasPasskeys }
    } catch (_) {
      return { showPasskeys: true }
    }
  }

  return { showPasskeys: false }
}

export const shouldShowRecoveryPhraseEvery8thTime = async () => {
  if (Math.floor(Math.random() * 8) === 0) {
    const devices = await securityConnector.getDevices()
    return { showRecovery: !devices.recoveryDevice }
  }
  return { showRecovery: false }
}

import { DelegationIdentity, WebAuthnIdentity } from "@dfinity/identity"
import * as Sentry from "@sentry/browser"

import {
  fetchProfile,
  Profile,
  registerAccount,
} from "frontend/integration/identity-manager"
import {
  AuthSession,
  LocalDeviceAuthSession,
} from "frontend/state/authentication"
import {
  AuthorizationRequest,
  getScope,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"

import {
  authState,
  CaptchaChallenge,
  Device,
  fetchDelegate,
  login,
  lookup,
  registerInternetIdentity,
  requestFEDelegationChain,
} from "."
import { ii } from "../actors"
import { deviceInfo } from "../device"
import { identityFromDeviceList } from "../identity"
import { setProfile } from "../identity-manager/profile"
import { apiResultToLoginResult } from "./api-result-to-login-result"

export async function loginWithAnchor(
  _: unknown,
  event: { data: { anchor: string; withSecurityDevices?: boolean } },
): Promise<LocalDeviceAuthSession> {
  console.debug("loginWithAnchor", {
    anchor: event.data.anchor,
    withSecurityDevices: event.data.withSecurityDevices,
  })
  const authResult = apiResultToLoginResult(
    await login(BigInt(event.data.anchor), event.data.withSecurityDevices),
  )
  console.debug("loginWithAnchor", { authResult })

  if (authResult.tag === "ok") {
    Sentry.setUser({ id: event.data.anchor })
    return {
      sessionSource: "localDevice",
      delegationIdentity: DelegationIdentity.fromDelegation(
        authResult.sessionKey,
        authResult.chain,
      ),
      identity: authResult.sessionKey,
    }
  } else if ("message" in authResult) {
    throw new Error(`loginWithAnchor ${authResult.message}`)
  }

  throw new Error(`loginWithAnchor Unreachable`)
}

export async function fetchDelegateService(
  context: { authSession?: AuthSession; authRequest?: AuthorizationRequest },
  event: { data: { accountId: string } },
): Promise<ThirdPartyAuthSession> {
  console.debug("fetchDelegateService", { context, event })
  if (!context.authSession) {
    const message = "context.authSession missing"
    console.error("fetchDelegateService", { message })
    throw new Error(`fetchDelegateService ${message}`)
  }
  if (!context.authRequest) {
    const message = "AuthorizationRequest missing in context."
    console.error("fetchDelegateService", { message })
    throw new Error(`fetchDelegateService ${message}`)
  }
  // FIXME: profile needs to be updated before this.
  const account = await fetchProfile()
  console.debug(`fetchDelegateService fetchProfile`, {
    account,
  })
  const scope = getScope(
    context.authRequest.hostname,
    Number(event.data.accountId),
    context.authRequest.derivationOrigin,
  )
  console.debug(`fetchDelegateService getScope`, {
    scope,
  })
  const delegate = await fetchDelegate(
    account.anchor,
    scope,
    Array.from(context.authRequest.sessionPublicKey),
    context.authRequest.maxTimeToLive,
  )
  console.debug(`fetchDelegateService fetchDelegate`, {
    delegate,
  })
  return delegate
}

export async function loginService(context: {
  devices?: Device[]
}): Promise<LocalDeviceAuthSession> {
  if (!context.devices) throw new Error(`loginService devices missing`)

  const multiIdent = identityFromDeviceList(context.devices)
  const { sessionKey, chain } = await requestFEDelegationChain(multiIdent)
  console.debug("loginService", { multiIdent, sessionKey, chain })

  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )
  console.debug("loginService", {
    delegationIdentity,
    principalId: delegationIdentity.getPrincipal().toText(),
  })

  authState.set(
    multiIdent._actualIdentity!,
    delegationIdentity,
    ii,
    chain,
    sessionKey,
  )

  return {
    sessionSource: "localDevice",
    identity: multiIdent,
    delegationIdentity,
  }
}

export async function registerService(
  context: {
    authSession?: AuthSession
    webAuthnIdentity?: WebAuthnIdentity
    challenge?: CaptchaChallenge
  },
  event: { data: string },
): Promise<LocalDeviceAuthSession> {
  const identity = context.authSession?.identity || context.webAuthnIdentity

  if (!identity) {
    const error = new Error("Missing identity.")
    console.error(`registerService`, error)
    throw error
  }
  if (!context.challenge?.challengeKey) {
    const error = new Error(
      `registerService Missing required challenge context.`,
    )
    console.error(`registerService`, error)
    throw error
  }

  // Create account with internet identity.
  const { anchor, delegationIdentity } = await registerInternetIdentity(
    identity as WebAuthnIdentity, // It's not actually always a WebAuthnIdentity 😬
    deviceInfo.newDeviceName,
    { key: context.challenge.challengeKey, chars: event.data },
  )

  try {
    // Register the account with identity manager.
    setProfile(await registerAccount(anchor))
  } catch (e) {
    console.error(e)
    throw new Error(
      `registerService Could not register new account, please try again.`,
    )
  }

  return {
    anchor,
    identity,
    delegationIdentity,
    sessionSource: "localDevice",
  }
}

export async function fetchAuthenticatorDevicesService(context: {
  profile: Profile
}) {
  console.debug("fetchAuthenticatorDevicesService", context)
  const devices = await lookup(Number(context.profile.anchor), false)
  console.debug(`fetchAuthenticatorDevicesService lookup`, { devices })
  return devices
}

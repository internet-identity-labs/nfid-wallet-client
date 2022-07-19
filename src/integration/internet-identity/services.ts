import { DelegationIdentity, WebAuthnIdentity } from "@dfinity/identity"

import {
  fetchAccount,
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
  fetchDelegate as _fetchDelegate,
  lookup,
  registerInternetIdentity,
  requestFEDelegation,
  requestFEDelegationChain,
} from "."
import { ii } from "../actors"
import { deviceInfo } from "../device"
import { identityFromDeviceList } from "../identity"

export async function fetchDelegate(
  context: { authSession?: AuthSession; authRequest?: AuthorizationRequest },
  event: { data: string },
): Promise<ThirdPartyAuthSession> {
  if (!context.authSession) {
    throw new Error("AuthSession missing in context.")
  }
  if (!context.authRequest) {
    throw new Error("AuthorizationRequest missing in context.")
  }
  const account = await fetchAccount()
  const scope = getScope(context.authRequest.hostname, Number(event.data))
  return await _fetchDelegate(
    account.anchor,
    scope,
    Array.from(context.authRequest.sessionPublicKey),
    context.authRequest.maxTimeToLive,
  )
}

export async function loginService(context: {
  devices?: Device[]
}): Promise<LocalDeviceAuthSession> {
  if (!context.devices) throw new Error("devices missing")

  const multiIdent = identityFromDeviceList(context.devices)
  const { sessionKey, chain } = await requestFEDelegationChain(multiIdent)

  return {
    sessionSource: "localDevice",
    identity: multiIdent,
    delegationIdentity: DelegationIdentity.fromDelegation(sessionKey, chain),
  }
}

export async function register(
  context: {
    authSession?: AuthSession
    webAuthnIdentity?: WebAuthnIdentity
    challenge?: CaptchaChallenge
  },
  event: { data: string },
): Promise<LocalDeviceAuthSession> {
  const identity = context.authSession?.identity || context.webAuthnIdentity
  if (!identity) {
    throw new Error("Missing identity.")
  }
  if (!context.challenge?.challengeKey) {
    throw new Error(`Missing required challenge context.`)
  }

  // Create account with internet identity.
  const anchor = await registerInternetIdentity(
    identity as WebAuthnIdentity, // It's not actually always a WebAuthnIdentity 😬
    deviceInfo.newDeviceName,
    { key: context.challenge.challengeKey, chars: event.data },
  )

  const delegationIdentity = (await requestFEDelegation(identity))
    .delegationIdentity

  authState.set(identity, delegationIdentity, ii)

  console.log(delegationIdentity, await lookup(anchor, true))

  try {
    // Register the account with identity manager.
    console.log(await identity.getPrincipal().toText())
    await registerAccount(anchor)
  } catch (e) {
    console.error(e)
    throw new Error("Could not register new account, please try again.")
  }

  return {
    anchor,
    identity,
    delegationIdentity,
    sessionSource: "localDevice",
  }
}

export async function fetchAuthenticatorDevicesService(context: {
  anchor: number
}) {
  console.debug(">> fetchAuthenticatorDevicesService", context)
  const devices = await lookup(context.anchor, false)
  console.debug(">> fetchAuthenticatorDevicesService lookup", { devices })
  return devices
}

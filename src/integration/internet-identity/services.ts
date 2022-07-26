import { DelegationIdentity, WebAuthnIdentity } from "@dfinity/identity"

import {
  fetchProfile,
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
  lookup,
  registerInternetIdentity,
  requestFEDelegationChain,
} from "."
import { ii } from "../actors"
import { deviceInfo } from "../device"
import { identityFromDeviceList } from "../identity"
import { Profile } from "../identity-manager/profile"

export async function fetchDelegateService(
  context: { authSession?: AuthSession; authRequest?: AuthorizationRequest },
  event: { data: { accountId: string } },
): Promise<ThirdPartyAuthSession> {
  console.debug(fetchDelegateService.name, { context, event })
  if (!context.authSession) {
    const message = "context.authSession missing"
    console.error(fetchDelegateService.name, { message })
    throw new Error(message)
  }
  if (!context.authRequest) {
    const message = "AuthorizationRequest missing in context."
    console.error(fetchDelegateService.name, { message })
    throw new Error(message)
  }
  // FIXME: profile needs to be updated before this.
  const account = await fetchProfile()
  console.debug(`${fetchDelegateService.name} ${fetchProfile.name}`, {
    account,
  })
  const scope = getScope(
    context.authRequest.hostname,
    Number(event.data.accountId),
    context.authRequest.derivationOrigin,
  )
  console.debug(`${fetchDelegateService.name} ${getScope.name}`, {
    scope,
  })
  const delegate = await fetchDelegate(
    account.anchor,
    scope,
    Array.from(context.authRequest.sessionPublicKey),
    context.authRequest.maxTimeToLive,
  )
  console.debug(`${fetchDelegateService.name} ${fetchDelegate.name}`, {
    delegate,
  })
  return delegate
}

export async function loginService(context: {
  devices?: Device[]
}): Promise<LocalDeviceAuthSession> {
  if (!context.devices) throw new Error("devices missing")

  const multiIdent = identityFromDeviceList(context.devices)
  const { sessionKey, chain } = await requestFEDelegationChain(multiIdent)
  console.debug(loginService.name, { multiIdent, sessionKey, chain })

  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )
  console.debug(loginService.name, {
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
    console.error("registerService", error)
    throw error
  }
  if (!context.challenge?.challengeKey) {
    const error = new Error(`Missing required challenge context.`)
    console.error("registerService", error)
    throw error
  }

  // Create account with internet identity.
  const { anchor, delegationIdentity } = await registerInternetIdentity(
    identity as WebAuthnIdentity, // It's not actually always a WebAuthnIdentity 😬
    deviceInfo.newDeviceName,
    { key: context.challenge.challengeKey, chars: event.data },
  )

  authState.set(identity, delegationIdentity, ii)

  try {
    // Register the account with identity manager.
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
  profile: Profile
}) {
  console.debug(">> fetchAuthenticatorDevicesService", context)
  const devices = await lookup(Number(context.profile.anchor), false)
  console.debug(">> fetchAuthenticatorDevicesService lookup", { devices })
  return devices
}

import { DelegationIdentity, WebAuthnIdentity } from "@dfinity/identity"

import {
  authState,
  requestFEDelegationChain,
  im,
  setProfileToStorage,
  Icon,
  Profile,
  fetchDelegate,
  DeviceType,
  loadProfileFromStorage,
} from "@nfid/integration"

import {
  fetchProfile,
  registerProfileWithAccessPoint,
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

import { deviceInfo, getBrowserName, getIcon } from "../device"
import { identityFromDeviceList } from "../identity"

import { apiResultToLoginResult } from "./api-result-to-login-result"

import {
  CaptchaChallenge,
  Device,
  login,
  lookup,
  registerInternetIdentity,
  registerInternetIdentityWithII,
} from "."

export async function loginWithAnchor(
  _: unknown,
  event: { data: { anchor: number; withSecurityDevices?: boolean } },
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
    const delegationIdentity = DelegationIdentity.fromDelegation(
      authResult.sessionKey,
      authResult.chain,
    )
    await authState.set({
      identity: authResult.sessionKey,
      delegationIdentity,
      chain: authResult.chain,
      sessionKey: authResult.sessionKey,
    })

    im.use_access_point([getBrowserName()]).catch((error) => {
      throw new Error(`loginWithAnchor im.use_access_point: ${error.message}`)
    })

    // When used platform authenticator
    // Then write profile to storage
    if (!event.data.withSecurityDevices) {
      const profile = await fetchProfile()
      await setProfileToStorage(profile)
    }
    return {
      sessionSource: "localDevice",
      anchor: Number(event.data.anchor),
      delegationIdentity,
      identity: authResult.sessionKey,
    }
  } else if ("message" in authResult) {
    throw new Error(authResult.message)
  }
  throw new Error(`loginWithAnchor Unreachable`)
}

export async function fetchDelegateService(
  context: { authSession?: AuthSession; authRequest?: AuthorizationRequest },
  event: { data: { accountId: string } },
): Promise<ThirdPartyAuthSession> {
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

  return delegate
}

export async function loginService(context: {
  devices?: Device[]
}): Promise<LocalDeviceAuthSession> {
  if (!context.devices) throw new Error(`loginService devices missing`)

  const multiIdent = identityFromDeviceList(context.devices)
  const { sessionKey, chain } = await requestFEDelegationChain(multiIdent)

  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )

  await authState.set({
    identity: multiIdent._actualIdentity!,
    delegationIdentity,
    chain,
    sessionKey,
  })

  im.use_access_point([getBrowserName()]).catch((error) => {
    throw new Error(`loginService im.use_access_point: ${error.message}`)
  })

  const profile = await loadProfileFromStorage()
  if (!profile?.anchor)
    throw new Error("loginService cannot load profile from storage")

  return {
    sessionSource: "localDevice",
    anchor: profile?.anchor,
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
): Promise<AuthSession> {
  const sessionSource = context.webAuthnIdentity
    ? "localDevice"
    : context.authSession?.sessionSource
  if (!sessionSource)
    throw new Error("registerService cannot determine sessionSource")

  console.debug("registerService", { sessionSource })
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
  let anchor: number,
    delegationIdentity = identity as DelegationIdentity

  if (context.authSession?.sessionSource === "ii") {
    anchor = await registerInternetIdentityWithII(
      Array.from(new Uint8Array(identity.getPublicKey().toDer())),
      deviceInfo.newDeviceName,
      { key: context.challenge.challengeKey, chars: event.data },
    )
  } else {
    const result = await registerInternetIdentity(
      identity as WebAuthnIdentity, // It's not actually always a WebAuthnIdentity 😬
      deviceInfo.newDeviceName,
      { key: context.challenge.challengeKey, chars: event.data },
    )

    anchor = result.anchor
    delegationIdentity = result.delegationIdentity
  }

  try {
    // Register the account with identity manager.
    const account = { anchor }
    const pubKey = Array.from(
      new Uint8Array(
        authState.get()?.delegationIdentity?.getPublicKey().toDer() ?? [],
      ),
    )
    // TODO create some factory for this
    const accessPoint =
      sessionSource === "google"
        ? {
            deviceType: DeviceType.Email,
            icon: "google" as Icon,
            device: "Google",
            browser: `${
              deviceInfo.browser.name ?? getBrowserName()
            } with google account`,
            pubKey,
          }
        : sessionSource === "ii"
          ? {
              deviceType: DeviceType.Unknown,
              icon: "ii" as Icon,
              device: "Internet Identity",
              browser: delegationIdentity.getPrincipal().toString(),
              pubKey,
            }
          : {
              icon: getIcon(deviceInfo),
              device: deviceInfo.newDeviceName,
              browser: deviceInfo.browser.name ?? "Mobile",
              pubKey,
              deviceType: DeviceType.Unknown,
            }
    console.debug("RouterRegisterDeviceDecider handleRegister", {
      account,
      accessPoint,
    })
    const profile = await registerProfileWithAccessPoint(anchor, accessPoint)

    // Only in case this device has registered, we set the config in storage
    if (sessionSource === "localDevice") {
      await setProfileToStorage(profile)
    }
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
    sessionSource,
  }
}

export async function fetchAuthenticatorDevicesService(context: {
  profile: Profile
}) {
  const devices = await lookup(
    Number(context.profile.anchor),
    (x) => x.purpose === "authentication",
  )
  console.debug(`fetchAuthenticatorDevicesService lookup`, { devices })
  return devices
}

import { DelegationIdentity } from "@dfinity/identity"

import { authState, im, setProfileToStorage } from "@nfid/integration"

import { getBrowserName } from "frontend/integration/device"
import { fetchProfile } from "frontend/integration/identity-manager"
import { login } from "frontend/integration/internet-identity"
import { apiResultToLoginResult } from "frontend/integration/internet-identity/api-result-to-login-result"
import { LocalDeviceAuthSession } from "frontend/state/authentication"

export async function authWithAnchor({
  anchor,
  withSecurityDevices,
}: {
  anchor: number
  withSecurityDevices?: boolean
}): Promise<LocalDeviceAuthSession> {
  const authResult = apiResultToLoginResult(
    await login(BigInt(anchor), withSecurityDevices),
  )

  if (authResult.tag !== "ok" && "message" in authResult)
    throw new Error(authResult.message)

  if (authResult.tag !== "ok")
    throw new Error("We couldn't authenticate you using this device")

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
  if (!withSecurityDevices) {
    const profile = await fetchProfile()
    setProfileToStorage(profile)
  }

  return {
    sessionSource: "localDevice",
    anchor: Number(anchor),
    delegationIdentity,
    identity: authResult.sessionKey,
  }
}

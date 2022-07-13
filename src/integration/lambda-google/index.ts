import { DelegationIdentity } from "@dfinity/identity"

import { loginfromGoogleDevice } from "../internet-identity"

declare const SIGNIN_GOOGLE: string

if (!SIGNIN_GOOGLE)
  throw new Error("Google lambda proxy SIGNIN_GOOGLE is not defined")

interface GoogleDeviceResult {
  identity: DelegationIdentity
  isExisting: boolean
}

interface GoogleDeviceResultExternal {
  identity: string
  is_existing: boolean
}

// NOTE: Discussion point! In referencing code to create this method, I noticed that we tend to capture global profile/authentication state when a "login" event like this one occurs. While the state machine will not play nicely with existing global react state patterns, we could consider sending a message to an actor dedicated to profile/auth state. In any event, that logic should exist in the state layer, not here in the integration layer.
async function mapGoogleDeviceResult(
  external: GoogleDeviceResultExternal,
): Promise<GoogleDeviceResult> {
  const { sessionKey, chain } = await loginfromGoogleDevice(external.identity)
  return {
    identity: DelegationIdentity.fromDelegation(sessionKey, chain),
    isExisting: external.is_existing,
  }
}

export async function fetchGoogleDevice(
  token: string,
): Promise<GoogleDeviceResult> {
  const response = await fetch(SIGNIN_GOOGLE, {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: {
      "Content-Type": "application/json",
    },
  })
  return mapGoogleDeviceResult(await response.json())
}

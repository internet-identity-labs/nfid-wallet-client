import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import { loginfromGoogleDevice } from "../../internet-identity"

declare const SIGNIN_GOOGLE: string

if (!SIGNIN_GOOGLE)
  throw new Error("Google lambda proxy SIGNIN_GOOGLE is not defined")

export interface GoogleDeviceResult {
  identity: DelegationIdentity
  isExisting: boolean
  sessionKey: Ed25519KeyIdentity
}

interface GoogleDeviceResultExternal {
  identity: string
  is_existing: boolean
}

async function mapGoogleDeviceResult(
  external: GoogleDeviceResultExternal,
): Promise<GoogleDeviceResult> {
  const { sessionKey, chain } = await loginfromGoogleDevice(external.identity)
  return {
    identity: DelegationIdentity.fromDelegation(sessionKey, chain),
    sessionKey,
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

import { Ed25519KeyIdentity } from "@dfinity/identity"

import { requestFEDelegation } from "frontend/integration/internet-identity"
import { GoogleAuthSession } from "frontend/state/authentication"

declare const SIGNIN_GOOGLE: string

if (!SIGNIN_GOOGLE)
  throw new Error("Google lambda proxy SIGNIN_GOOGLE is not defined")

export interface GoogleDeviceResult {
  identity: Ed25519KeyIdentity
  isExisting: boolean
}

interface GoogleDeviceResultExternal {
  identity: string
  is_existing: boolean
}

/**
 * Map response from google lambda into idiomatic form.
 * @param external a response from the google lambda
 * @returns Ed25519KeyIdentity and boolean flag whether this google account has an NFID account already
 */
async function mapGoogleDeviceResult(
  external: GoogleDeviceResultExternal,
): Promise<GoogleDeviceResult> {
  const identity = Ed25519KeyIdentity.fromJSON(external.identity)
  return {
    identity,
    isExisting: external.is_existing,
  }
}

/**
 * Fetch II device associated with a google account oauth token
 * @param token an authentication credential received from google oauth
 * @returns Ed25519KeyIdentity and boolean flag whether this google account has an NFID account already
 */
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

/**
 * Create an auth session from a google device retrieved from the lambda.
 * @param response response from the google lambda
 * @returns a google powered auth session that can be used to sign messages to II / NFID
 */
export async function signInWithGoogle(
  response: GoogleDeviceResult,
): Promise<GoogleAuthSession> {
  if (!response.isExisting) {
    throw new Error("Cannot sign in with device before creating an account.")
  }
  const delegationIdentity = await requestFEDelegation(response.identity)
  return {
    identity: response.identity,
    delegationIdentity: delegationIdentity.delegationIdentity,
    sessionSource: "google",
  }
}

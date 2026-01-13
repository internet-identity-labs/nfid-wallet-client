import { Ed25519KeyIdentity } from "@dfinity/identity"

import { authState, im, requestFEDelegation } from "@nfid/integration"
import { getBrowserName } from "@nfid/utils"

import { fetchProfile } from "frontend/integration/identity-manager"
import "frontend/integration/internet-identity"
import { GoogleAuthSession } from "frontend/state/authentication"

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
 * @param deviceResult response from the google lambda
 * @returns a google powered auth session that can be used to sign messages to II / NFID
 */
export async function getGoogleAuthSession(
  deviceResult: GoogleDeviceResult,
): Promise<GoogleAuthSession> {
  console.debug("getGoogleAuthSession", { deviceResult })
  const delegationIdentity = await requestFEDelegation(deviceResult.identity)
  // We must call use_access_point (idk y), and we need to update the global agent identity to do so. I don't love putting this global auth state here.
  await authState.set({
    identity: deviceResult.identity,
    delegationIdentity: delegationIdentity.delegationIdentity,
    chain: delegationIdentity.chain,
    sessionKey: delegationIdentity.sessionKey,
  })
  let profile
  try {
    profile = await fetchProfile()
    im.use_access_point([`${getBrowserName()} with google account`]).catch(
      (error) => {
        throw new Error(
          `getGoogleAuthSession im.use_access_point: ${error.message}`,
        )
      },
    )
  } catch (fetchProfileError: any) {
    if (fetchProfileError.code !== 404) {
      throw fetchProfileError
    }
  }

  const session = {
    sessionSource: "google",
    anchor: profile?.anchor,
    identity: deviceResult.identity,
    delegationIdentity: delegationIdentity.delegationIdentity,
  } as GoogleAuthSession

  console.debug("getGoogleAuthSession", { session })

  return session
}

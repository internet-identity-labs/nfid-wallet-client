import { SignIdentity } from "@dfinity/agent"
import { Ed25519KeyIdentity } from "@dfinity/identity"

import { AuthorizationRequest } from "frontend/state/authorization"
import { AuthorizationMachineContext } from "frontend/state/machines/authorization/authorization"

import {
  createPersona,
  fetchProfile,
  fetchAccounts,
  selectAccounts,
  mapPersonaToLegacy,
  verifyToken,
} from "."
import { getNextAccountId } from "./persona/utils"
import { loadProfileFromLocalStorage } from "./profile"

export function getLocalStorageProfileService() {
  const profile = loadProfileFromLocalStorage()
  if (!profile)
    throw new Error(
      `getLocalStorageProfileService getProfileService unregistered device`,
    )

  return Promise.resolve(profile)
}

export function isDeviceRegistered() {
  return !!loadProfileFromLocalStorage()
}

export async function fetchAccountsService(
  context: AuthorizationMachineContext,
) {
  if (!context.authRequest?.hostname) {
    throw new Error(
      `fetchAccountsService Cannot filter personas without hostname`,
    )
  }
  const personas = await fetchAccounts()
  return selectAccounts(personas, context.authRequest.hostname)
}

export async function createAccountService(
  context: AuthorizationMachineContext,
): Promise<{ accountId: string }> {
  console.debug(`createAccountService`, { context })
  if (!context.authRequest)
    throw new Error(`createAccountService context.authRequest missing`)
  if (!context.accounts)
    throw new Error(`createAccountService context.accounts missing`)
  const accountId = getNextAccountId(context.accounts.map(mapPersonaToLegacy))
  const createPersonaReposne = await createPersona(
    context.authRequest?.hostname,
    accountId,
    `Account #${accountId}`,
  )
  console.debug(`createAccountService`, { createPersonaReposne })
  return { accountId }
}

export async function fetchProfileService() {
  console.debug(`fetchProfileService`)
  return await fetchProfile()
}

/** xstate service to verify sms verification code */
export async function verifySmsService(
  context: unknown,
  { data }: { data: string },
) {
  try {
    return await verifyToken(data)
  } catch (e) {
    console.error("Error in verifySmsService", e)
    throw {
      error: "There was a problem with your submission. Please try again.",
    }
  }
}

/**
 * We need a session key and authRequest to perform authorization in the pn cred flow.
 * Normally, the third part app would pass us a session key, but in this case we generate a third
 * party app delegation, which simplifies the client api a bit, but might be a bad call.
 */
export async function createAuthoRequest(context: {
  hostname?: string
}): Promise<{
  authRequest: AuthorizationRequest
  sessionKey: SignIdentity
}> {
  const sessionKey = Ed25519KeyIdentity.generate()
  if (!context.hostname) throw new Error("Missing hostname")
  return {
    sessionKey,
    authRequest: {
      hostname: context.hostname,
      maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
      sessionPublicKey: new Uint8Array(sessionKey.getPublicKey().toDer()),
    },
  }
}

import { AuthSession } from "frontend/state/authentication"
import { AuthorizationMachineContext } from "frontend/state/machines/authorization/authorization"

import {
  createPersona,
  fetchProfile,
  fetchAccounts,
  selectAccounts,
  mapPersonaToLegacy,
  verifyToken,
} from "."
import { verifyPhoneNumber } from "../lambda/phone"
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

/** xstate service to send sms verification code */
export async function verifyPhoneNumberService(context: {
  authSession?: AuthSession
  phone?: string
}) {
  const principal = context.authSession?.delegationIdentity.getPrincipal()
  try {
    if (!context.phone) throw new Error("Missing phone number")
    if (!principal) throw new Error("Missing principal")
    const res = await verifyPhoneNumber(context.phone)
    return await res
  } catch (e) {
    console.error("Error in verifyPhoneNumberService", e)
    throw {
      error:
        "There was an issue verifying your phone number, please try again.",
    }
  }
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

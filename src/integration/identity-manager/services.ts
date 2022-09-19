import { AuthorizationMachineContext } from "frontend/state/machines/authorization/authorization"

import {
  createAccount,
  fetchProfile,
  fetchAccounts,
  selectAccounts,
  mapPersonaToLegacy,
  verifyToken,
  processApplicationOrigin,
} from "."
import { fetchPrincipal } from "../actors"
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
  return selectAccounts(
    personas,
    context.authRequest.hostname,
    context.authRequest.derivationOrigin,
  )
}

export async function createAccountService(
  context: AuthorizationMachineContext,
): Promise<{ accountId: string }> {
  if (!context.authRequest)
    throw new Error(`createAccountService context.authRequest missing`)
  if (!context.accounts)
    throw new Error(`createAccountService context.accounts missing`)
  const accountId = getNextAccountId(context.accounts.map(mapPersonaToLegacy))
  const domain =
    context.authRequest?.derivationOrigin || context.authRequest?.hostname

  processApplicationOrigin(
    context.authRequest?.hostname,
    context.authRequest?.derivationOrigin ?? domain,
    context.appMeta?.name,
  )

  const createPersonaReposne = await createAccount(
    domain,
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
  console.debug(verifySmsService.name, {
    caller: (await fetchPrincipal()).toText(),
    token: data,
  })
  try {
    return await verifyToken(data)
  } catch (e) {
    console.error("Error in verifySmsService", e)
    throw new Error(
      "verifySmsService: There was a problem with your submission. Please try again.",
    )
  }
}

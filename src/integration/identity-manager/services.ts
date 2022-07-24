import { AuthorizationMachineContext } from "frontend/state/machines/authorization/authorization"

import {
  createPersona,
  fetchProfile,
  fetchAccounts,
  selectAccounts,
  mapPersonaToLegacy,
} from "."
import { getNextAccountId } from "./persona/utils"
import { loadProfileFromLocalStorage, profile } from "./profile"

export function getLocalStorageProfileService() {
  const profile = loadProfileFromLocalStorage()
  if (!profile) throw new Error("getProfileService unregistered device")

  return Promise.resolve(profile)
}

export function isDeviceRegistered() {
  return !!profile
}

export async function fetchAccountsService(
  context: AuthorizationMachineContext,
) {
  if (!context.authRequest?.hostname) {
    throw new Error("Cannot filter personas without hostname")
  }
  const personas = await fetchAccounts()
  return selectAccounts(personas, context.authRequest.hostname)
}

export async function createAccountService(
  context: AuthorizationMachineContext,
): Promise<{ accountId: string }> {
  console.debug("createAccount", { context })
  if (!context.authRequest) throw new Error("context.authRequest missing")
  if (!context.accounts) throw new Error("context.accounts missing")
  const accountId = getNextAccountId(context.accounts.map(mapPersonaToLegacy))
  const createPersonaReposne = await createPersona(
    context.authRequest?.hostname,
    accountId,
    `Account #${accountId}`,
  )
  console.debug("createAccount", { createPersonaReposne })
  return { accountId }
}

export async function fetchProfileService() {
  console.debug("fetchProfileService")
  return await fetchProfile()
}

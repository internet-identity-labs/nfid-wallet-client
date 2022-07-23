import { AuthorizationMachineContext } from "frontend/state/machines/authorization/authorization"

import {
  createPersona,
  fetchAccount,
  fetchPersonas as _fetchPersonas,
  selectPersonas,
} from "."
import { fetchProfile, profile } from "./profile"

export function getProfileService() {
  const profile = fetchProfile()
  if (!profile) throw new Error("getProfileService unregistered device")

  return Promise.resolve(profile)
}

export function isDeviceRegistered() {
  return !!profile
}

export async function fetchAccounts(context: AuthorizationMachineContext) {
  if (!context.authRequest?.hostname) {
    throw new Error("Cannot filter personas without hostname")
  }
  const personas = await _fetchPersonas()
  return selectPersonas(personas, context.authRequest.hostname)
}

export async function createAccount(
  context: AuthorizationMachineContext,
): Promise<string> {
  console.debug("createAccount", { context })
  if (!context.authRequest) throw new Error("Missing auth request")
  const createPersonaReposne = await createPersona(
    context.authRequest?.hostname,
    `${context.accounts?.length || "0"}`,
    "Account #1",
  )
  console.debug("createAccount", { createPersonaReposne })
  return `${context.accounts?.length || "0"}`
}

export async function fetchProfileService() {
  console.debug("fetchProfileService")
  return await fetchAccount()
}
